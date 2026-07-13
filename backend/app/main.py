"""FastAPI main application — gateway, lifespan, and middleware."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.services.neo4j_service import neo4j_service
from app.services.sarvam_service import sarvam_service
from app.api import health, triage, websocket as ws_routes

settings = get_settings()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: connect to Neo4j. Shutdown: close connections."""
    logger.info("🚀 VaidyaVoice starting up...")
    await neo4j_service.connect()
    logger.info("✅ Neo4j connected")
    yield
    logger.info("🛑 Shutting down...")
    await neo4j_service.close()
    await sarvam_service.close()
    logger.info("✅ Connections closed")


app = FastAPI(
    title=settings.app_name,
    version="2.0.0",
    description="GraphRAG-powered rural health triage — voice in, voice out.",
    lifespan=lifespan
)

# CORS for Expo app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/health", tags=["Health"])
app.include_router(triage.router, prefix="/api/v1", tags=["Triage"])
app.include_router(ws_routes.router, tags=["WebSocket"])


@app.get("/")
async def root():
    return {
        "message": "VaidyaVoice API",
        "version": "2.0.0",
        "docs": "/docs"
    }
