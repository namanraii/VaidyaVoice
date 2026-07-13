"""REST API endpoints for triage."""
import logging
from fastapi import APIRouter, HTTPException
from typing import List

from app.models.schemas import AudioTriageRequest, TriageResponse
from app.services.triage_engine import triage_engine

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/triage/audio", response_model=TriageResponse)
async def triage_from_audio(request: AudioTriageRequest):
    """
    Full audio triage: receive base64 audio, return triage + audio response.
    This is the main endpoint for the Expo app.
    """
    try:
        result = await triage_engine.process_audio(
            audio_b64=request.audio_b64,
            session_id=request.session_id,
            language=request.language,
            current_medicines=request.current_medicines,
            location=request.location
        )
        return result
    except Exception as e:
        logger.error(f"Triage error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/triage/text", response_model=TriageResponse)
async def triage_from_text(request: AudioTriageRequest):
    """
    Text-only triage (skip STT) — for testing and fallback.
    Uses transcript field directly instead of audio_b64.
    """
    try:
        result = await triage_engine.process_text_only(
            transcript=request.audio_b64,  # Reuse field for text
            session_id=request.session_id,
            language=request.language,
            current_medicines=request.current_medicines
        )
        return result
    except Exception as e:
        logger.error(f"Text triage error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
