"""
Ada2AI Auth Middleware — Centralized authentication for Closed Pilot Mode.

SINGLE source of truth for all auth decisions.
NO duplicate auth logic across routes.

Modes:
  - PILOT_MODE=disabled  → all routes open (dev only)
  - PILOT_MODE=closed    → auth required on protected routes (default)
"""

import os
import logging
from typing import Optional
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("ada2ai.auth")

# ── Configuration ──────────────────────────────────
PILOT_MODE = os.getenv("PILOT_MODE", "closed")
PILOT_TOKEN = os.getenv("PILOT_TOKEN", "")

# ── Route Access Levels ────────────────────────────
PUBLIC_ROUTES = {"/", "/health", "/config"}


def verify_pilot_token(request: Request) -> Optional[str]:
    """Verify Authorization header. Returns user_id or None."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header:
        return None

    token = auth_header.replace("Bearer ", "").strip()
    if not token:
        return None

    # Closed Pilot: verify against shared pilot token
    if PILOT_TOKEN and token == PILOT_TOKEN:
        return "pilot_user"

    # Transition: accept Supabase anon key for existing frontend
    supabase_key = os.getenv("SUPABASE_ANON_KEY", "")
    if supabase_key and token == supabase_key:
        return "pilot_user"

    return None


class AuthMiddleware(BaseHTTPMiddleware):
    """Centralized auth middleware — NO duplicate auth in routes."""

    async def dispatch(self, request: Request, call_next):
        # Skip auth for OPTIONS (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)

        # Skip auth if pilot mode disabled (dev only)
        if PILOT_MODE == "disabled":
            return await call_next(request)

        path = request.url.path

        # Public routes — always accessible
        if path in PUBLIC_ROUTES:
            return await call_next(request)

        # Static assets — always accessible
        if path.startswith("/static") or path.endswith((".js", ".css", ".ico")):
            return await call_next(request)

        # All other routes require pilot auth
        user_id = verify_pilot_token(request)

        if user_id is None:
            logger.warning(
                "AUTH_DENIED method=%s path=%s ip=%s",
                request.method, path,
                request.client.host if request.client else "unknown"
            )
            raise HTTPException(
                status_code=401,
                detail="Authentication required. Provide Authorization: Bearer <token>"
            )

        # Attach user info to request state
        request.state.user_id = user_id
        return await call_next(request)