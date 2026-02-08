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
    GEMINI_MODEL: str = "gemini-3-flash-preview"

    # Rate Limiting
    MAX_CONCURRENT_AI_CALLS: int = 5

    # Twitter/X OAuth 1.0a
    TWITTER_BEARER_TOKEN: str = ""
    TWITTER_ACCESS_TOKEN: str = ""
    TWITTER_ACCESS_TOKEN_SECRET: str = ""
    
    # Twitter/X OAuth 2.0
    TWITTER_CLIENT_ID: str = ""
    TWITTER_CLIENT_SECRET: str = ""

    # Bluesky
    BLUESKY_HANDLE: str = ""
    BLUESKY_PASSWORD: str = ""


settings = Settings()
