"""Render Workflows — durable multi-agent pipeline with retries and parallel execution."""
import asyncio
import logging
from typing import Dict, Any, List

from render_sdk import Workflows, Retry

from app.config import get_settings
from app.models.schemas import LanguageCode
from app.services.neo4j_service import neo4j_service
from app.services.sarvam_service import sarvam_service
from app.services.triage_engine import triage_engine

logger = logging.getLogger(__name__)
settings = get_settings()

app = Workflows()

# ───────────────────────────────────────────────────────────
# Individual tasks (each durable, with retries)
# ───────────────────────────────────────────────────────────

@app.task(
    retry=Retry(max_retries=3, wait_duration_ms=1000, backoff_scaling=1.5),
    timeout_seconds=120,
    plan="standard"
)
async def transcribe_audio(audio_b64: str, language: str) -> Dict[str, Any]:
    """Step 1: Sarvam Saaras v3 STT (REST)."""
    import base64
    audio_bytes = base64.b64decode(audio_b64)
    lang = LanguageCode(language) if language else LanguageCode.UNKNOWN
    result = await sarvam_service.stt_rest(audio_bytes, lang)
    return {
        "transcript": result.get("transcript", ""),
        "detected_language": result.get("language_code", language),
        "confidence": result.get("language_probability", 0.0)
    }


@app.task(
    retry=Retry(max_retries=2, wait_duration_ms=2000, backoff_scaling=2.0),
    timeout_seconds=60,
    plan="standard"
)
async def extract_symptoms(transcript: str, language: str) -> Dict[str, Any]:
    """Step 2: Sarvam-30B LLM structured symptom extraction."""
    lang = LanguageCode(language) if language else LanguageCode.HI
    result = await sarvam_service.extract_symptoms(transcript, lang)
    return result


@app.task(
    retry=Retry(max_retries=3, wait_duration_ms=1000, backoff_scaling=1.5),
    timeout_seconds=60,
    plan="standard"
)
async def query_graph(symptoms: List[str], free_text: str, language: str) -> Dict[str, Any]:
    """Step 3: Neo4j GraphRAG — rank conditions by weighted symptom match."""
    lang = LanguageCode(language) if language else LanguageCode.HI
    conditions = await neo4j_service.find_conditions_graphrag(symptoms, free_text, lang)
    return {
        "conditions": [c.model_dump() for c in conditions],
        "top_condition": conditions[0].name if conditions else "Unknown"
    }


@app.task(
    retry=Retry(max_retries=2, wait_duration_ms=2000, backoff_scaling=2.0),
    timeout_seconds=60,
    plan="starter"
)
async def check_interactions(condition: str, current_medicines: List[str]) -> Dict[str, Any]:
    """Step 4: Neo4j multi-hop drug interaction with safe alternatives."""
    if not current_medicines:
        return {"interactions": []}
    interactions = await neo4j_service.check_drug_interactions(condition, current_medicines)
    return {"interactions": [i.model_dump() for i in interactions]}


@app.task(
    retry=Retry(max_retries=2, wait_duration_ms=1000, backoff_scaling=1.5),
    timeout_seconds=60,
    plan="standard"
)
async def compose_response(
    condition: str, 
    interactions: List[Dict], 
    language: str
) -> Dict[str, Any]:
    """Step 5: Sarvam-30B compose urgency-aware triage advice."""
    lang = LanguageCode(language) if language else LanguageCode.HI
    advice_text = await sarvam_service.compose_triage_response(condition, interactions, lang)
    return {"advice_text": advice_text}


@app.task(
    retry=Retry(max_retries=2, wait_duration_ms=1000, backoff_scaling=1.5),
    timeout_seconds=60,
    plan="standard"
)
async def synthesize_speech(text: str, language: str) -> Dict[str, Any]:
    """Step 6: Sarvam Bulbul v3 TTS."""
    import base64
    lang = LanguageCode(language) if language else LanguageCode.HI
    speaker = sarvam_service.get_speaker(lang)
    audio_bytes = await sarvam_service.tts_rest(text, lang, speaker)
    return {"audio_b64": base64.b64encode(audio_bytes).decode("utf-8")}


@app.task(
    retry=Retry(max_retries=2, wait_duration_ms=1000, backoff_scaling=1.5),
    timeout_seconds=30,
    plan="starter"
)
async def store_session(session_id: str, symptoms: List[str], language: str):
    """Step 7: Store patient session in Neo4j temporal graph."""
    await neo4j_service.record_symptom_session(session_id, symptoms, language)
    return {"stored": True}


@app.task(
    retry=Retry(max_retries=1, wait_duration_ms=500, backoff_scaling=1.0),
    timeout_seconds=30,
    plan="starter"
)
async def get_reasoning_path(symptoms: List[str], condition: str) -> Dict[str, Any]:
    """Step 8: Get traversable reasoning path for Graph Viz screen."""
    path = await neo4j_service.get_reasoning_path(symptoms, condition)
    return path


# ───────────────────────────────────────────────────────────
# Orchestrator: Parent task that chains + parallelizes
# ───────────────────────────────────────────────────────────

@app.task(
    retry=Retry(max_retries=1, wait_duration_ms=2000, backoff_scaling=2.0),
    timeout_seconds=300,
    plan="standard"
)
async def triage_orchestrator(
    audio_b64: str,
    session_id: str,
    language: str = "hi-IN",
    current_medicines: List[str] = None
) -> Dict[str, Any]:
    """
    Parent workflow: orchestrates all triage steps.
    
    Sequential: STT → extract → (parallel: graph + drugs) → compose → TTS
    Parallel: condition query and drug check run simultaneously.
    """
    current_medicines = current_medicines or []
    
    # Sequential: STT
    stt_result = await transcribe_audio(audio_b64, language)
    transcript = stt_result["transcript"]
    detected_language = stt_result.get("detected_language", language)
    
    # Sequential: Extract symptoms
    extraction = await extract_symptoms(transcript, detected_language)
    symptoms = extraction.get("symptoms", [])
    free_text = extraction.get("free_text", transcript)
    urgency = extraction.get("urgency", "low")
    
    # Parallel: Graph query + Drug check (independent operations)
    graph_task = query_graph(symptoms, free_text, detected_language)
    drug_task = check_interactions(
        "Unknown",  # Will be updated after graph returns
        current_medicines
    )
    
    graph_result, drug_result = await asyncio.gather(graph_task, drug_task)
    
    # If top condition changed, re-check drugs (rare edge case)
    top_condition = graph_result.get("top_condition", "Unknown")
    if drug_result.get("interactions") and top_condition != "Unknown":
        drug_result = await check_interactions(top_condition, current_medicines)
    
    # Sequential: Compose + TTS
    compose_result = await compose_response(
        top_condition, 
        drug_result.get("interactions", []), 
        detected_language
    )
    advice_text = compose_result["advice_text"]
    
    tts_result = await synthesize_speech(advice_text, detected_language)
    
    # Parallel: Store session + Get reasoning path (independent)
    await asyncio.gather(
        store_session(session_id, symptoms, detected_language),
        get_reasoning_path(symptoms, top_condition)
    )
    reasoning_path = await get_reasoning_path(symptoms, top_condition)
    
    # Determine triage level
    conditions = graph_result.get("conditions", [])
    is_emergency = any(c.get("is_emergency", False) for c in conditions) or urgency == "high"
    triage_level = "red" if is_emergency else ("yellow" if urgency == "medium" else "green")
    
    return {
        "transcript": transcript,
        "extracted_symptoms": symptoms,
        "ranked_conditions": conditions,
        "top_condition": top_condition,
        "triage_level": triage_level,
        "is_emergency": is_emergency,
        "drug_interactions": drug_result.get("interactions", []),
        "advice_text": advice_text,
        "audio_response_b64": tts_result["audio_b64"],
        "hospital_needed": is_emergency,
        "reasoning_path": reasoning_path,
        "session_id": session_id
    }


# ───────────────────────────────────────────────────────────
# Chaos Engineering: Deliberate failure task for demo
# ───────────────────────────────────────────────────────────

@app.task(
    retry=Retry(max_retries=3, wait_duration_ms=1000, backoff_scaling=2.0),
    timeout_seconds=30,
    plan="starter"
)
async def simulate_failure(should_fail: bool = True) -> Dict[str, Any]:
    """Deliberately fails to demonstrate Render retry dashboard."""
    if should_fail:
        raise RuntimeError("Simulated 429 rate-limit error — Render will retry with backoff!")
    return {"status": "recovered"}
