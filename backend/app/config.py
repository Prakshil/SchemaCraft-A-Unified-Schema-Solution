"""
QueryMind Configuration
Environment variables and settings
"""
from __future__ import annotations

from pydantic_settings import BaseSettings
from pydantic import field_validator
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
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _parse_cors_origins(cls, value):
        """Allow CORS_ORIGINS to be set as JSON list or comma-separated string.

        Render env vars are often easiest as:
        - CORS_ORIGINS=["https://example.onrender.com"]
        or
        - CORS_ORIGINS=https://example.onrender.com,http://localhost:3000
        """
        if value is None:
            return value

        # If provided as a string, accept comma-separated format.
        if isinstance(value, str):
            raw_items = [item.strip() for item in value.split(",")]
            items = [item for item in raw_items if item]
        else:
            items = value

        # Normalize: strip trailing slashes so origins match browser Origin header.
        try:
            return [str(origin).strip().rstrip("/") for origin in items if str(origin).strip()]
        except TypeError:
            # If it's not iterable, just return as-is and let Pydantic raise.
            return value
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
