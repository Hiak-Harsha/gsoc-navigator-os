import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "GSoC Navigator OS"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./gsoc_navigator.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "gsoc-navigator-super-secret-key-change-in-prod-2027")
    
    # GitHub Integration
    GITHUB_TOKEN: Optional[str] = os.getenv("GITHUB_TOKEN", None)
    GITHUB_CLIENT_ID: Optional[str] = os.getenv("GITHUB_CLIENT_ID", None)
    GITHUB_CLIENT_SECRET: Optional[str] = os.getenv("GITHUB_CLIENT_SECRET", None)
    
    # AI / LLM Configuration
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "auto") # auto, gemini, openai, heuristic
    
    # Background Monitoring
    MONITORING_INTERVAL_SECONDS: int = 300 # 5 minutes default
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
