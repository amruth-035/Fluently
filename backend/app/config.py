from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """App configuration, loaded from environment variables / the .env file.

    Values are optional for now so the server can start before Supabase
    and OpenAI are set up. We'll tighten this in the auth step.
    """

    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_jwt_secret: str = ""
    openai_api_key: str = ""
    database_url: str = ""

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
