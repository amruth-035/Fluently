from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str
    supabase_storage_bucket: str = "recordings"
    supabase_jwt_secret: str
    openai_api_key: str
    cors_origins: str = Field(
        default="http://localhost:5173",
        description=(
            "Comma-separated allowed browser origins. "
            "Production: set to your deployed frontend URL(s), e.g. https://app.example.com"
        ),
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
