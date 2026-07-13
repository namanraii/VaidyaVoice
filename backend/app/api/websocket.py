"""WebSocket endpoint for real-time streaming triage."""
import logging
import base64
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.models.schemas import LanguageCode
from app.services.triage_engine import triage_engine

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/ws/triage")
async def triage_streaming(websocket: WebSocket):
    """
    WebSocket for real-time voice triage.
    
    Protocol:
    - Client sends: {"type": "audio", "payload": "base64_audio", "session_id": "uuid", "language": "hi-IN"}
    - Server sends: {"type": "event", "payload": "processing", "session_id": "uuid"}
    - Server sends: {"type": "text", "payload": {"transcript": "..."}, "session_id": "uuid"}
    - Server sends: {"type": "text", "payload": {"triage": {...}}, "session_id": "uuid"}
    - Server sends: {"type": "audio", "payload": "base64_audio", "session_id": "uuid"}
    """
    await websocket.accept()
    logger.info("WebSocket connection accepted")
    
    try:
        while True:
            message = await websocket.receive_text()
            data = json.loads(message)
            
            msg_type = data.get("type")
            payload = data.get("payload", "")
            session_id = data.get("session_id", "")
            language = data.get("language", "hi-IN")
            current_medicines = data.get("current_medicines", [])
            
            if msg_type == "audio":
                # Acknowledge processing
                await websocket.send_json({
                    "type": "event",
                    "payload": "processing",
                    "session_id": session_id
                })
                
                # Process full triage
                try:
                    lang = LanguageCode(language) if language in [l.value for l in LanguageCode] else LanguageCode.HI
                    result = await triage_engine.process_audio(
                        audio_b64=payload,
                        session_id=session_id,
                        language=lang,
                        current_medicines=current_medicines
                    )
                    
                    # Send transcript
                    await websocket.send_json({
                        "type": "text",
                        "payload": {"transcript": result.transcript},
                        "session_id": session_id
                    })
                    
                    # Send triage result
                    await websocket.send_json({
                        "type": "text",
                        "payload": {
                            "triage_level": result.triage_level.value,
                            "top_condition": result.top_condition,
                            "is_emergency": result.is_emergency,
                            "extracted_symptoms": result.extracted_symptoms,
                            "drug_interactions": [i.model_dump() for i in result.drug_interactions],
                            "reasoning_path": result.reasoning_path
                        },
                        "session_id": session_id
                    })
                    
                    # Send audio response
                    await websocket.send_json({
                        "type": "audio",
                        "payload": result.audio_response_b64,
                        "session_id": session_id
                    })
                    
                except Exception as e:
                    logger.error(f"Streaming triage error: {e}")
                    await websocket.send_json({
                        "type": "event",
                        "payload": f"error: {str(e)}",
                        "session_id": session_id
                    })
                    
            elif msg_type == "ping":
                await websocket.send_json({
                    "type": "event",
                    "payload": "pong",
                    "session_id": session_id
                })
                
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
