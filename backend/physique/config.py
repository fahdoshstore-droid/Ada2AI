"""Configuration for Ada2Physique backend — env-driven, no hardcoded secrets."""
from __future__ import annotations
import os
from dataclasses import dataclass


def _env(name: str, default: str = "") -> str:
    return os.getenv(name, default) or default


@dataclass(frozen=True)
class Settings:
    # Supabase (shared Ada2AI project)
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_jwt_secret: str

    # AI providers (reuse Ada2AI ai-provider pattern)
    anthropic_api_key: str
    anthropic_model: str
    ollama_base_url: str
    ollama_text_model: str
    gemini_api_key: str

    # Service
    cors_origin: str
    log_level: str

    @property
    def has_service_role(self) -> bool:
        return bool(self.supabase_service_role_key)

    @property
    def has_jwt_secret(self) -> bool:
        return bool(self.supabase_jwt_secret)


def get_settings() -> Settings:
    return Settings(
        supabase_url=_env("SUPABASE_URL"),
        supabase_anon_key=_env("SUPABASE_ANON_KEY"),
        supabase_service_role_key=_env("SUPABASE_SERVICE_ROLE_KEY"),
        supabase_jwt_secret=_env("SUPABASE_JWT_SECRET"),
        anthropic_api_key=_env("ANTHROPIC_API_KEY"),
        anthropic_model=_env("ANTHROPIC_MODEL", "claude-sonnet-4-5-20250914"),
        ollama_base_url=_env("OLLAMA_BASE_URL", "http://localhost:11434"),
        ollama_text_model=_env("OLLAMA_TEXT_MODEL", "qwen3:14b"),
        gemini_api_key=_env("GEMINI_API_KEY"),
        cors_origin=_env("CORS_ORIGIN", "*"),
        log_level=_env("LOG_LEVEL", "INFO"),
    )
