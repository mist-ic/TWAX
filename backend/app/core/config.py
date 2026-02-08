"""Application configuration."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # API Keys
    GEMINI_API_KEY: str = ""

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://localhost/twax"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Gemini
    GEMINI_MODEL: str = "gemini-2.0-flash"
    GEMINI_TEMPERATURE: float = 0.7

    # Rate Limiting
    MAX_CONCURRENT_AI_CALLS: int = 5


settings = Settings()
