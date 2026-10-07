import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NER Smart Logistics & Accessibility Intelligence"
    API_V1_STR: str = "/api/v1"
    
    # Database
    MONGO_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "ner_logistics_db"
    
    # JWT & Auth
    SECRET_KEY: str = "ner-secret-key-educational-prototype-sih-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]
    
    # External APIs
    OSRM_BASE_URL: str = "https://router.project-osrm.org"
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1/forecast"
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
