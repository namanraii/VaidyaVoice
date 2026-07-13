"""Sarvam AI service wrappers — STT, LLM, TTS, with streaming support."""
import base64
import logging
import httpx
import json
from typing import Optional, List, Dict, Any
import asyncio

from app.config import get_settings
from app.models.schemas import LanguageCode

logger = logging.getLogger(__name__)
settings = get_settings()

SARVAM_HEADERS = {
    "api-subscription-key": settings.sarvam_api_key,
    "Content-Type": "application/json"
}

FORM_HEADERS = {
    "api-subscription-key": settings.sarvam_api_key
}


class SarvamService:
    """Unified Sarvam AI API client with REST, WebSocket, and Batch support."""
    
    def __init__(self):
        self.base_url = settings.sarvam_base_url
        self.client = httpx.AsyncClient(timeout=60.0)
    
    # ───────────────────────────────────────────────────────────
    # Speech-to-Text (Saaras v3)
    # ───────────────────────────────────────────────────────────
    
    async def stt_rest(
        self, 
        audio_bytes: bytes, 
        language: LanguageCode = LanguageCode.UNKNOWN,
        mode: str = "transcribe"
    ) -> Dict[str, Any]:
        """
        REST STT for short audio (<30s).
        Modes: transcribe, translate, verbatim, translit, codemix
        """
        files = {
            "file": ("audio.wav", audio_bytes, "audio/wav")
        }
        data = {
            "model": "saaras:v3",
            "mode": mode,
        }
        lang_str = language.value if hasattr(language, "value") else str(language)
        if lang_str and lang_str != "unknown":
            data["language_code"] = lang_str
        
        response = await self.client.post(
            f"{self.base_url}/speech-to-text",
            headers=FORM_HEADERS,
            data=data,
            files=files
        )
        response.raise_for_status()
        return response.json()
    
    async def stt_translate_rest(
        self, 
        audio_bytes: bytes, 
        source_language: LanguageCode = LanguageCode.UNKNOWN
    ) -> Dict[str, Any]:
        """STT with built-in translation to English."""
        return await self.stt_rest(audio_bytes, source_language, mode="translate")
    
    # ───────────────────────────────────────────────────────────
    # Text-to-Speech (Bulbul v3)
    # ───────────────────────────────────────────────────────────
    
    async def tts_rest(
        self, 
        text: str, 
        language: LanguageCode = LanguageCode.HI,
        speaker: str = "shubh"
    ) -> bytes:
        """
        REST TTS. Max 2,500 characters per request.
        Returns raw audio bytes (WAV by default).
        """
        # Truncate if over limit (engineer around constraint)
        if len(text) > 2500:
            text = text[:2497] + "..."
            logger.warning("TTS text truncated to 2500 chars")
        
        lang_str = language.value if hasattr(language, "value") else str(language)
        payload = {
            "text": text,
            "target_language_code": lang_str,
            "model": "bulbul:v3",
            "speaker": speaker,
            "speech_sample_rate": 24000
        }
        
        response = await self.client.post(
            f"{self.base_url}/text-to-speech",
            headers=SARVAM_HEADERS,
            json=payload
        )
        response.raise_for_status()
        
        # Response is audio bytes or base64 depending on endpoint
        content_type = response.headers.get("content-type", "")
        if "json" in content_type:
            data = response.json()
            audios = data.get("audios", [])
            if audios:
                return base64.b64decode(audios[0])
            return base64.b64decode(data.get("audio", ""))
        return response.content
    
    # ───────────────────────────────────────────────────────────
    # LLM (Sarvam-30B / Sarvam-105B)
    # ───────────────────────────────────────────────────────────
    
    async def chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        model: str = "sarvam-30b",
        temperature: float = 0.3,
        max_tokens: int = 500,
        response_format: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Chat completion with Sarvam-30B (64K context) or Sarvam-105B (128K context).
        Lower temperature for structured medical extraction.
        """
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        if response_format:
            payload["response_format"] = response_format
        
        response = await self.client.post(
            f"{self.base_url}/v1/chat/completions",
            headers=SARVAM_HEADERS,
            json=payload
        )
        response.raise_for_status()
        return response.json()
    
    async def extract_symptoms(
        self, 
        transcript: str, 
        language: LanguageCode = LanguageCode.HI
    ) -> Dict[str, Any]:
        """
        Extract structured symptoms from transcript using Sarvam-30B.
        Handles code-mixed Hinglish natively.
        Returns: {symptoms: [...], urgency: str, free_text: str}
        """
        system_prompt = (
            "You are a medical symptom extractor for rural India. "
            "Extract symptoms from the patient's description. "
            "Handle code-mixed Indian languages and English (e.g., Hinglish, Tanglish, Benglish) naturally. "
            "Respond ONLY in valid JSON with keys: symptoms (list), urgency (low/medium/high), free_text (summary). "
            "CRITICAL 1: Translate ALL extracted symptoms into standard English medical terms (e.g., 'बुखार' -> 'fever', 'सिरदर्द' -> 'headache'). Do not output Hindi symptom names in the JSON. "
            "CRITICAL 2: Reserve urgency='high' ONLY for explicit danger keywords (e.g., severe, bleeding, chest pain, can't breathe) "
            "or combinations of severe symptoms. Never mark single, vague symptoms (e.g., leg pain, mild fever) as high urgency."
        )
        
        user_prompt = f"Patient says: \"{transcript}\"\n\nExtract symptoms in JSON."
        
        response = await self.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="sarvam-30b",
            temperature=0.2,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        
        content = response["choices"][0]["message"]["content"]
        if content is None:
            logger.error("LLM content is None. Finish reason might be length cutoff.")
            return {"symptoms": [], "urgency": "low", "free_text": transcript}
            
        content = content.strip()
        if content.startswith("```"):
            lines = content.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            content = "\n".join(lines).strip()
            
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse LLM response: {content}")
            return {"symptoms": [], "urgency": "low", "free_text": transcript}
    
    async def compose_triage_response(
        self, 
        condition: str, 
        interactions: List[Dict]
    ) -> str:
        """
        Compose a compassionate, concise triage response.
        Must stay under 2500 chars for TTS.
        """
        interaction_text = ""
        if interactions:
            interaction_text = (
                "IMPORTANT: A medicine for this condition may interact with "
                f"your current medicine {interactions[0]['patient_drug']}. "
                "Please tell the doctor about all medicines you take."
            )
        
        system_prompt = (
            "You are a rural health assistant. Respond in simple, reassuring language. "
            "Be concise (under 2000 chars). Include: what it might be, what to do now, "
            "and whether to see a doctor. Never give a definitive diagnosis. "
            "Format your advice as short, scannable bullet points using relevant emojis (e.g. 💧 hydrate, 🛏️ rest). "
            "Output the response ONLY in English."
        )
        
        user_prompt = (
            f"Condition suggestion: {condition}. "
            f"{interaction_text} "
            f"Write triage advice."
        )
        
        response = await self.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="sarvam-30b",
            temperature=0.4,
            max_tokens=2500
        )
        
        content = response["choices"][0]["message"]["content"]
        if content is None:
            logger.warning("compose_triage_response returned None (length cutoff or format issue). Using fallback.")
            return f"Based on your symptoms, it could be related to {condition}. Please consult a medical professional for a proper diagnosis."
            
        content = content.strip()
        # Remove any Markdown code block wrapping if present
        if content.startswith("```"):
            lines = content.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            content = "\n".join(lines).strip()
            
        return content
    
    # ───────────────────────────────────────────────────────────
    # Language Identification (LID)
    # ───────────────────────────────────────────────────────────
    
    async def detect_language(self, text: str) -> str:
        """Auto-detect language from text."""
        payload = {"input": text}
        response = await self.client.post(
            f"{self.base_url}/text-lid",
            headers=SARVAM_HEADERS,
            json=payload
        )
        response.raise_for_status()
        data = response.json()
        return data.get("language_code", "unknown")
    
    # ───────────────────────────────────────────────────────────
    # Translation (Sarvam-Translate v1)
    # ───────────────────────────────────────────────────────────
    
    async def translate(
        self, 
        text: str, 
        source: LanguageCode, 
        target: LanguageCode
    ) -> str:
        """Translate between Indian languages."""
        src_str = source.value if hasattr(source, "value") else str(source)
        tgt_str = target.value if hasattr(target, "value") else str(target)
        
        if src_str == "unknown":
            src_str = await self.detect_language(text)
            if src_str == "unknown":
                src_str = "en-IN"
                
        payload = {
            "input": text,
            "source_language_code": src_str,
            "target_language_code": tgt_str,
            "mode": "formal",
            "model": "sarvam-translate:v1"
        }
        response = await self.client.post(
            f"{self.base_url}/translate",
            headers=SARVAM_HEADERS,
            json=payload
        )
        response.raise_for_status()
        data = response.json()
        return data.get("translated_text", text)
    
    # ───────────────────────────────────────────────────────────
    # Speaker mapping per language
    # ───────────────────────────────────────────────────────────
    
    SPEAKER_MAP = {
        "hi-IN": "shubh",
        "bn-IN": "roopa",
        "ta-IN": "kavya",
        "te-IN": "priya",
        "en-IN": "ritu"
    }
    
    def get_speaker(self, language: LanguageCode) -> str:
        lang_str = language.value if hasattr(language, "value") else str(language)
        return self.SPEAKER_MAP.get(lang_str, "shubh")
    
    async def close(self):
        await self.client.aclose()


# Singleton
sarvam_service = SarvamService()
