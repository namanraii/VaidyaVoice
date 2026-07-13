"""Backend configuration with placeholder API keys — fill in before deployment."""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App
    app_name: str = "VaidyaVoice"
    debug: bool = False
    
    # Sarvam AI (verified key)
    sarvam_api_key: str = "sk_ei79ezzp_eibYoBTtsV07nFOuQXFpK15c"
    sarvam_base_url: str = "https://api.sarvam.ai"
    
    # Neo4j AuraDB (fill in real credentials before deployment)
    neo4j_uri: str = "neo4j+s://35ddc00e.databases.neo4j.io:7687"
    neo4j_user: str = "35ddc00e"
    neo4j_password: str = "aya4oQPbzyMbsiTGQ65DBKNkOB8OxmnZEEwP2rb75Xs"
    
    # Redis (Render provides this on private network)
    redis_url: str = "redis://localhost:6379/0"
    
    # Render Workflows (auto-detected when deployed on Render)
    render_workflow_service: str = "vaidyavoice-workflow"
    
    # Postgres (for session logs — Render provides)
    database_url: str = "postgresql://localhost/vaidyavoice"
    
    # Google Maps (for emergency hospital finder)
    google_maps_api_key: str = "YOUR_GOOGLE_MAPS_API_KEY"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
