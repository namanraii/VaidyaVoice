"""Pydantic schemas for request/response models."""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class LanguageCode(str, Enum):
    """Supported language codes."""
    HI = "hi-IN"
    BN = "bn-IN"
    TA = "ta-IN"
    TE = "te-IN"
    EN = "en-IN"
    MR = "mr-IN"
    GU = "gu-IN"
    KN = "kn-IN"
    OR = "or-IN"
    ML = "ml-IN"
    PA = "pa-IN"
    AS = "as-IN"
    UNKNOWN = "unknown"


class TriageLevel(str, Enum):
    """Color-coded triage levels."""
    GREEN = "green"    # Self-care
    YELLOW = "yellow"  # See a doctor
    RED = "red"        # Emergency


class SymptomInput(BaseModel):
    """Input: extracted symptom list from transcript."""
    symptoms: List[str] = Field(..., description="List of symptom names")
    free_text: Optional[str] = Field(None, description="Original patient description")
    language: LanguageCode = Field(default=LanguageCode.UNKNOWN)
    current_medicines: List[str] = Field(default_factory=list)
    risk_factors: List[str] = Field(default_factory=list)


class ConditionResult(BaseModel):
    """A ranked condition from the graph."""
    name: str
    name_local: Optional[str] = None
    severity_score: float
    is_emergency: bool
    matched_score: float
    matched_symptoms: List[str]
    confidence: float


class DrugInteraction(BaseModel):
    """Detected drug interaction."""
    dangerous_drug: str
    patient_drug: str
    severity: str
    safe_alternatives: List[str]


class TriageResponse(BaseModel):
    """Complete triage response to send to client."""
    transcript: str
    extracted_symptoms: List[str]
    ranked_conditions: List[ConditionResult]
    top_condition: Optional[str] = None
    triage_level: TriageLevel
    is_emergency: bool = False
    drug_interactions: List[DrugInteraction] = Field(default_factory=list)
    advice_text: str
    advice_text_local: Optional[str] = None
    audio_response_b64: Optional[str] = None
    hospital_needed: bool = False
    reasoning_path: Optional[Dict[str, Any]] = None
    session_id: str


class AudioTriageRequest(BaseModel):
    """Request from Expo app with audio data."""
    audio_b64: str = Field(..., description="Base64-encoded audio (WAV or MP3)")
    language: LanguageCode = Field(default=LanguageCode.UNKNOWN)
    session_id: str
    location: Optional[Dict[str, float]] = None
    current_medicines: List[str] = Field(default_factory=list)


class StreamingChunk(BaseModel):
    """WebSocket chunk for real-time streaming."""
    type: str = Field(..., pattern="^(audio|text|event)$")
    payload: Any
    session_id: str


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    neo4j_connected: bool
    sarvam_ready: bool
    version: str = "2.0.0"
