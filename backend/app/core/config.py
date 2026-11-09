from functools import lru_cache
from typing import Literal

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="STORYVERSE_",
        extra="ignore",
    )

    app_name: str = "StoryVerse API"
    environment: Literal["development", "test", "production"] = "development"
    api_prefix: str = "/api/v1"

    db_host: str = "127.0.0.1"
    db_port: int = 5432
    db_name: str = "storyverse_db"
    db_test_name: str = "storyverse_test_db"
    db_user: str = "storyverse_app"
    db_password: SecretStr | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()