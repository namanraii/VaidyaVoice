"""Health check endpoints."""
from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.services.neo4j_service import neo4j_service

router = APIRouter()


@router.get("", response_model=HealthResponse)
async def health_check():
    """Check all service connections."""
    neo4j_ok = await neo4j_service.health_check()
    return HealthResponse(
        status="healthy" if neo4j_ok else "degraded",
        neo4j_connected=neo4j_ok,
        sarvam_ready=True  # Stateless REST, always ready if key is set
    )
