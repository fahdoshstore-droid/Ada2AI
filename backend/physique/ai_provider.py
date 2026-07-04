"""
Ada2Physique AI provider — reuses the Ada2AI ai-provider pattern.

Selection (env-driven, automatic fallback, no manual config):
  1. Anthropic Claude (ANTHROPIC_API_KEY present) → primary
  2. Local Ollama (OLLAMA_BASE_URL)               → fallback

Gemini Vision is reserved for Phase 2/3 image tasks (see analyze_image stub).

No fake data: every call hits a real provider. If no provider is reachable,
functions raise so callers return a clean 503 instead of fabricated content.
"""
from __future__ import annotations
import json
import logging
from dataclasses import dataclass
from typing import Optional

import httpx

from .config import get_settings

logger = logging.getLogger("ada2physique.ai")


@dataclass
class AIResult:
    text: str
    model: str
    tokens: int = 0


def _call_anthropic(prompt: str, system: str, settings) -> AIResult:
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": settings.anthropic_api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    body = {
        "model": settings.anthropic_model,
        "max_tokens": 2048,
        "system": system,
        "messages": [{"role": "user", "content": prompt}],
    }
    with httpx.Client(timeout=60.0) as client:
        resp = client.post(url, headers=headers, json=body)
    if resp.status_code != 200:
        raise RuntimeError(f"Anthropic error {resp.status_code}: {resp.text[:200]}")
    data = resp.json()
    text = "".join(block.get("text", "") for block in data.get("content", []))
    usage = data.get("usage", {})
    return AIResult(text=text, model=data.get("model", settings.anthropic_model),
                    tokens=(usage.get("input_tokens", 0) + usage.get("output_tokens", 0)))


def _call_ollama(prompt: str, system: str, settings) -> AIResult:
    url = f"{settings.ollama_base_url.rstrip('/')}/api/chat"
    body = {
        "model": settings.ollama_text_model,
        "stream": False,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
    }
    with httpx.Client(timeout=120.0) as client:
        resp = client.post(url, json=body)
    if resp.status_code != 200:
        raise RuntimeError(f"Ollama error {resp.status_code}: {resp.text[:200]}")
    data = resp.json()
    return AIResult(text=data.get("message", {}).get("content", ""),
                    model=settings.ollama_text_model,
                    tokens=data.get("eval_count", 0))


def analyze_text(prompt: str, system: str = "You are an elite bodybuilding coach.") -> AIResult:
    """Generate a text completion, preferring Claude and falling back to Ollama."""
    settings = get_settings()
    if settings.anthropic_api_key:
        try:
            return _call_anthropic(prompt, system, settings)
        except Exception as exc:
            logger.warning("Anthropic call failed (%s); falling back to Ollama.", exc)
    if settings.ollama_base_url:
        return _call_ollama(prompt, system, settings)
    raise RuntimeError("No AI provider configured (set ANTHROPIC_API_KEY or OLLAMA_BASE_URL).")


def analyze_json(prompt: str, system: str, schema_hint: str) -> tuple[dict, AIResult]:
    """Generate structured JSON. Instructs the model to return strict JSON and parses it."""
    full_prompt = (
        f"{prompt}\n\n"
        f"Return ONLY a single valid JSON object (no markdown, no prose) matching:\n{schema_hint}"
    )
    result = analyze_text(full_prompt, system)
    text = result.text.strip()
    # Tolerate accidental code fences.
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
    parsed = json.loads(text)
    return parsed, result


def get_provider_status() -> dict:
    settings = get_settings()
    return {
        "primary": "anthropic" if settings.anthropic_api_key else None,
        "fallback": "ollama" if settings.ollama_base_url else None,
        "model": settings.anthropic_api_key and settings.anthropic_model or settings.ollama_text_model,
        "gemini": bool(settings.gemini_api_key),
    }
