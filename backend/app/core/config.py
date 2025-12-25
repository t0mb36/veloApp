from functools import lru_cache
from pathlib import Path

from pydantic import Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _find_env_file() -> str | None:
    """Find .env file in current dir or parent (project root).

    When running locally from /backend, the .env is in parent dir.
    When running in Docker, env vars are passed directly (no .env needed).
    """
    # Check current directory first
    if Path(".env").exists():
        return ".env"
    # Check parent directory (project root when running from /backend)
    if Path("../.env").exists():
        return "../.env"
    # No .env file found - rely on environment variables (Docker)
    return None


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=_find_env_file(),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        populate_by_name=True,
    )

    # Application
    app_name: str = "VeloApp API"
    debug: bool = False
    api_prefix: str = "/api"

    # Database
    database_url: PostgresDsn = Field(
        ...,
        description="PostgreSQL connection URL",
    )

    # Firebase Authentication
    # These are required for Firebase Admin SDK initialization
    # Empty defaults allow app to start without Firebase (auth endpoints will fail)
    firebase_project_id: str = Field(
        default="",
        description="Firebase project ID",
    )
    firebase_client_email: str = Field(
        default="",
        description="Firebase service account client email",
    )
    firebase_private_key: str = Field(
        default="",
        description="Firebase service account private key (PEM format)",
    )

    @field_validator("firebase_private_key", mode="before")
    @classmethod
    def parse_firebase_private_key(cls, v: str | None) -> str:
        """Handle escaped newlines in private key from environment variable."""
        if v:
            return v.replace("\\n", "\n")
        return v or ""

    @property
    def firebase_configured(self) -> bool:
        """Check if Firebase credentials are configured."""
        return bool(
            self.firebase_project_id
            and self.firebase_client_email
            and self.firebase_private_key
        )

    # Session settings
    session_cookie_expiry_days: int = Field(
        default=7,
        description="Number of days before session cookie expires",
    )

    @field_validator("database_url", mode="before")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        """Ensure async driver is used for PostgreSQL."""
        if v and v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    # CORS - stored as comma-separated string to avoid pydantic-settings JSON parsing
    cors_origins_str: str = Field(
        default="http://localhost:3000",
        alias="cors_origins",
        description="Comma-separated list of allowed CORS origins",
    )

    @property
    def cors_origins(self) -> list[str]:
        """Get CORS origins as a list."""
        if not self.cors_origins_str:
            return ["http://localhost:3000"]
        return [origin.strip() for origin in self.cors_origins_str.split(",") if origin.strip()]

    # Server
    host: str = "0.0.0.0"
    port: int = 8000


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
