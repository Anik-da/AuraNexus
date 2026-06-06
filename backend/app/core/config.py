from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AURANEXUS Backend Core"
    API_V1_STR: str = "/api/v1"
    
    # Security config
    JWT_SECRET_KEY: str = "aura_nexus_super_secret_cryptographic_key_9f2d7c"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # Firebase details
    FIREBASE_PROJECT_ID: str = "aura-nexus-esp"
    FIREBASE_STORAGE_BUCKET: str = "aura-nexus-esp.firebasestorage.app"
    
    # Hugging Face and Dataset settings
    HUGGINGFACE_API_TOKEN: str = ""
    LOCAL_DATASET_DIR: str = "c:/AURANEXUS/backend/dataset"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
