"""
Supabase service-role client for Ada2Physique privileged operations.

The backend is a trusted enforcer: it verifies the caller's JWT (see deps.py),
performs explicit authorization checks mirroring the database RLS rules, and uses
the service-role client for operations that require it (AI report persistence,
signed upload URLs, admin analytics, profile role lookups).

RLS remains enabled on every physique_* table as defense-in-depth for any client
that talks to Supabase directly (the frontend does, using the user's own JWT).
"""
from __future__ import annotations
from typing import Any, Optional
from supabase import create_client, Client

from .config import get_settings

_client: Optional[Client] = None


def get_service_client() -> Client:
    """Return a singleton service-role Supabase client, or raise if unconfigured."""
    global _client
    if _client is not None:
        return _client
    s = get_settings()
    if not s.supabase_url or not s.supabase_service_role_key:
        raise RuntimeError(
            "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured — "
            "backend privileged operations unavailable."
        )
    _client = create_client(s.supabase_url, s.supabase_service_role_key)
    return _client


def lookup_profile(uid: str) -> dict[str, Any]:
    """Fetch a user's profile row (service-role) to resolve user_type/role."""
    client = get_service_client()
    res = client.table("profiles").select("id, email, full_name, user_type, avatar_url").eq("id", uid).single().execute()
    return res.data or {}


def get_physique_role(uid: str) -> Optional[str]:
    """Return the Ada2Physique role ('athlete' | 'coach' | 'admin') or None."""
    profile = lookup_profile(uid)
    ut = (profile or {}).get("user_type")
    if ut in ("athlete", "coach", "admin"):
        return ut
    return None


def get_athlete_profile(uid: str) -> Optional[dict[str, Any]]:
    """Return the physique_athletes row for a user, or None if not onboarded."""
    client = get_service_client()
    res = client.table("physique_athletes").select("*").eq("athlete_id", uid).limit(1).execute()
    return res.data[0] if res.data else None


def get_coach_profile(uid: str) -> Optional[dict[str, Any]]:
    """Return the physique_coaches row for a user, or None if not onboarded."""
    client = get_service_client()
    res = client.table("physique_coaches").select("*").eq("coach_id", uid).limit(1).execute()
    return res.data[0] if res.data else None


def is_assigned_coach(coach_uid: str, athlete_uid: str) -> bool:
    """Mirror of the SQL physique_is_assigned_coach() helper, enforced server-side."""
    client = get_service_client()
    res = (
        client.table("physique_coach_athletes")
        .select("id")
        .eq("coach_id", coach_uid)
        .eq("athlete_id", athlete_uid)
        .eq("status", "active")
        .limit(1)
        .execute()
    )
    return bool(res.data)
