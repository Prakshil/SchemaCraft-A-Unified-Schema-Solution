"""
QueryMind Configuration
Environment variables and settings
"""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Configuration
    app_name: str = "SchemaForge"
    app_version: str = "1.0.0"
    debug: bool = True
    
    # LLM Configuration
    groq_api_key: str = ""
    openai_api_key: str = ""
    llm_provider: str = "groq"  # "groq" or "openai"
    llm_model: str = "llama-3.3-70b-versatile"  # Groq model
    
    # CORS Settings
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
