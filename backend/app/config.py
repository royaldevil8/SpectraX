from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "SpectraX"
    app_version: str = "0.1.0"
    environment: str = "development"

    database_url: str
    redis_url: str

    storage_path: str = str((Path(__file__).resolve().parents[3] / "storage").resolve())

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()