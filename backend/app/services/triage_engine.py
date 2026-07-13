"""Core triage engine — orchestrates GraphRAG, drug checks, and response composition."""
import logging
import base64
from typing import Dict, Any, List, Optional

from app.config import get_settings
from app.models.schemas import (
    TriageResponse, TriageLevel, ConditionResult, DrugInteraction, LanguageCode
)
from app.services.neo4j_service import neo4j_service
from app.services.sarvam_service import sarvam_service

logger = logging.getLogger(__name__)
settings = get_settings()


class TriageEngine:
    """End-to-end triage pipeline: STT → LLM extract → GraphRAG → drug check → TTS."""
    
    async def process_audio(
        self,
        audio_b64: str,
        session_id: str,
        language: LanguageCode = LanguageCode.UNKNOWN,
        current_medicines: List[str] = None,
        location: Optional[Dict[str, float]] = None
    ) -> TriageResponse:
        """
        Full triage pipeline.
        1. Decode audio
        2. STT → transcript
        3. LLM → extract symptoms
        4. GraphRAG → rank conditions
        5. Drug interaction check
        6. Compose response + TTS
        7. Store session in graph
        """
        current_medicines = current_medicines or []
        
        # Step 1: Decode audio
        audio_bytes = base64.b64decode(audio_b64)
        
        # Step 2: Speech-to-Text
        logger.info("Step 2: STT")
        stt_result = await sarvam_service.stt_rest(audio_bytes, language)
        transcript = stt_result.get("transcript", "")
        detected_language = stt_result.get("language_code", language.value)
        if language == LanguageCode.UNKNOWN and detected_language:
            language = LanguageCode(detected_language) if detected_language in [l.value for l in LanguageCode] else LanguageCode.HI

        # Skipping translation to English - Sarvam LLM handles Indian languages natively!        
        # Step 3: LLM Symptom Extraction
        logger.info("Step 3: LLM extract")
        extraction = await sarvam_service.extract_symptoms(transcript, language)
        symptoms = extraction.get("symptoms", [])
        urgency = extraction.get("urgency", "low")
        free_text = extraction.get("free_text", transcript)
        
        # Step 4: GraphRAG — Rank conditions
        logger.info("Step 4: GraphRAG")
        conditions = await neo4j_service.find_conditions_graphrag(
            symptoms=symptoms,
            free_text=free_text,
            language=language
        )
        
        # Step 5: Drug Interactions
        logger.info("Step 5: Drug interactions")
        top_condition = conditions[0].name if conditions else "Unknown"
        interactions = await neo4j_service.check_drug_interactions(
            condition_name=top_condition,
            current_medicines=current_medicines
        )
        
        # Step 6: Determine triage level
        is_emergency = False
        if urgency == "high":
            is_emergency = True
        elif conditions and any(c.is_emergency for c in conditions):
            # Require multiple symptoms or a very severe match to trigger emergency from graph
            if len(symptoms) >= 2 or (conditions[0].severity_score >= 0.8 and urgency == "medium"):
                is_emergency = True
        
        if is_emergency:
            triage_level = TriageLevel.RED
        elif urgency == "medium" or (conditions and conditions[0].severity_score >= 0.5):
            triage_level = TriageLevel.YELLOW
        else:
            triage_level = TriageLevel.GREEN
        
        # Step 7: Compose response + TTS
        logger.info("Step 7: Compose + TTS")
        advice_text_en = await sarvam_service.compose_triage_response(
            condition=top_condition,
            interactions=[i.model_dump() for i in interactions]
        )
        
        if language != LanguageCode.UNKNOWN and language != LanguageCode.EN:
            advice_text = await sarvam_service.translate(advice_text_en, LanguageCode.EN, language)
        else:
            advice_text = advice_text_en
        
        speaker = sarvam_service.get_speaker(language)
        audio_response = await sarvam_service.tts_rest(advice_text, language, speaker)
        audio_response_b64 = base64.b64encode(audio_response).decode("utf-8")
        
        # Step 8: Store session in graph
        logger.info("Step 8: Store session")
        await neo4j_service.record_symptom_session(session_id, symptoms, language.value)
        
        # Step 9: Get reasoning path for Graph Viz
        reasoning_path = await neo4j_service.get_reasoning_path(symptoms, top_condition)
        
        return TriageResponse(
            transcript=transcript,
            extracted_symptoms=symptoms,
            ranked_conditions=conditions,
            top_condition=top_condition,
            triage_level=triage_level,
            is_emergency=is_emergency,
            drug_interactions=interactions,
            advice_text=advice_text,
            audio_response_b64=audio_response_b64,
            hospital_needed=is_emergency,
            reasoning_path=reasoning_path,
            session_id=session_id
        )
    
    async def process_text_only(
        self,
        transcript: str,
        session_id: str,
        language: LanguageCode = LanguageCode.HI,
        current_medicines: List[str] = None
    ) -> TriageResponse:
        """Text-only pipeline (skip STT) — for testing and fallback."""
        current_medicines = current_medicines or []
        
        # Skipping translation to English - Sarvam LLM handles Indian languages natively!        
        extraction = await sarvam_service.extract_symptoms(transcript, language)
        symptoms = extraction.get("symptoms", [])
        urgency = extraction.get("urgency", "low")
        free_text = extraction.get("free_text", transcript)
        
        conditions = await neo4j_service.find_conditions_graphrag(
            symptoms=symptoms, free_text=free_text, language=language
        )
        
        top_condition = conditions[0].name if conditions else "Unknown"
        interactions = await neo4j_service.check_drug_interactions(top_condition, current_medicines)
        
        is_emergency = False
        if urgency == "high":
            is_emergency = True
        elif conditions and any(c.is_emergency for c in conditions):
            if len(symptoms) >= 2 or (conditions[0].severity_score >= 0.8 and urgency == "medium"):
                is_emergency = True
        
        triage_level = TriageLevel.RED if is_emergency else (TriageLevel.YELLOW if (urgency == "medium" or (conditions and conditions[0].severity_score >= 0.5)) else TriageLevel.GREEN)
        
        advice_text_en = await sarvam_service.compose_triage_response(
            top_condition, [i.model_dump() for i in interactions]
        )
        if language != LanguageCode.UNKNOWN and language != LanguageCode.EN:
            advice_text = await sarvam_service.translate(advice_text_en, LanguageCode.EN, language)
        else:
            advice_text = advice_text_en
        speaker = sarvam_service.get_speaker(language)
        audio_response = await sarvam_service.tts_rest(advice_text, language, speaker)
        audio_response_b64 = base64.b64encode(audio_response).decode("utf-8")
        
        await neo4j_service.record_symptom_session(session_id, symptoms, language.value)
        reasoning_path = await neo4j_service.get_reasoning_path(symptoms, top_condition)
        
        return TriageResponse(
            transcript=transcript,
            extracted_symptoms=symptoms,
            ranked_conditions=conditions,
            top_condition=top_condition,
            triage_level=triage_level,
            is_emergency=is_emergency,
            drug_interactions=interactions,
            advice_text=advice_text,
            audio_response_b64=audio_response_b64,
            hospital_needed=is_emergency,
            reasoning_path=reasoning_path,
            session_id=session_id
        )


# Singleton
triage_engine = TriageEngine()
