"""
Ada2AI Structured Logging — Lightweight observability for Closed Pilot.

NO heavy monitoring infrastructure. Just structured logs for:
- endpoint access
- auth events
- intelligence pipeline stages
- upload failures
- errors
"""

import os
import logging
import json
import time
from datetime import datetime, timezone

# ── Configuration ──────────────────────────────────
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_FORMAT = os.getenv("LOG_FORMAT", "json")  # json | text

# ── JSON Formatter ────────────────────────────────
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        # Add structured fields if present
        if hasattr(record, "event_type"):
            log_entry["event"] = record.event_type
        if hasattr(record, "path"):
            log_entry["path"] = record.path
        if hasattr(record, "method"):
            log_entry["method"] = record.method
        if hasattr(record, "duration_ms"):
            log_entry["duration_ms"] = record.duration_ms
        if hasattr(record, "player_id"):
            log_entry["player_id"] = record.player_id
        if hasattr(record, "status"):
            log_entry["status"] = record.status

        if record.exc_info and record.exc_info[0]:
            log_entry["error"] = self.formatException(record.exc_info)

        return json.dumps(log_entry, ensure_ascii=False)


class TextFormatter(logging.Formatter):
    def format(self, record):
        ts = datetime.now(timezone.utc).strftime("%H:%M:%S")
        extra = ""
        for field in ("event_type", "path", "method", "duration_ms", "player_id", "status"):
            if hasattr(record, field):
                extra += f" {field}={getattr(record, field)}"
        return f"{ts} {record.levelname:5} [{record.name}] {record.getMessage()}{extra}"


# ── Setup ─────────────────────────────────────────
def setup_logging():
    """Configure structured logging for Ada2AI."""
    root = logging.getLogger("ada2ai")
    root.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))

    handler = logging.StreamHandler()
    if LOG_FORMAT == "json":
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(TextFormatter())

    root.addHandler(handler)
    # Prevent double logging
    root.propagate = False

    return root


# ── Convenience Loggers ────────────────────────────
def get_logger(name: str) -> logging.Logger:
    """Get a logger under the ada2ai namespace."""
    return logging.getLogger(f"ada2ai.{name}")


# ── Log Helpers ────────────────────────────────────
def log_pipeline_stage(stage: str, player_id=None, duration_ms=None, status="ok", **kwargs):
    """Log an intelligence pipeline stage."""
    logger = get_logger("pipeline")
    extra = {"event_type": "pipeline_stage", "status": status}
    if player_id is not None:
        extra["player_id"] = player_id
    if duration_ms is not None:
        extra["duration_ms"] = round(duration_ms, 1)
    extra.update(kwargs)
    logger.info(f"stage={stage}", extra=extra)


def log_endpoint(method: str, path: str, status: int, duration_ms: float = None):
    """Log an API endpoint access."""
    logger = get_logger("endpoint")
    extra = {"event_type": "endpoint", "method": method, "path": path, "status": status}
    if duration_ms is not None:
        extra["duration_ms"] = round(duration_ms, 1)
    logger.info(f"{method} {path} → {status}", extra=extra)


def log_upload(filename: str, status: str, error: str = None):
    """Log an upload event."""
    logger = get_logger("upload")
    extra = {"event_type": "upload", "status": status}
    if error:
        logger.error(f"upload_failed file={filename} error={error}", extra=extra)
    else:
        logger.info(f"upload_ok file={filename}", extra=extra)


# Initialize on import
setup_logging()