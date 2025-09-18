from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # API Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-change-in-production"
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/ai_code_platform"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # AI Services
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    
    # Vector Database
    PINECONE_API_KEY: str = ""
    PINECONE_ENVIRONMENT: str = "us-west1-gcp"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
        "https://your-frontend-domain.com"
    ]
    
    # Code Analysis
    MAX_CODE_SIZE: int = 100000  # 100KB
    SUPPORTED_LANGUAGES: List[str] = [
        "python", "javascript", "typescript", "java", 
        "cpp", "go", "rust", "csharp", "php"
    ]
    
    # Testing
    DEFAULT_COVERAGE_TARGET: float = 0.8
    MAX_TEST_GENERATION_TIME: int = 300  # 5 minutes
    
    # Code Review
    QUALITY_THRESHOLD: float = 7.0
    SECURITY_SCAN_ENABLED: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()