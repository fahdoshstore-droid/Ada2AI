"""
Authentication & authorization dependencies for Ada2Physique.

Verifies the caller's Supabase JWT (locally with the JWT secret when available,
otherwise via the Supabase Auth user endpoint) and resolves the Ada2Physique
role from the profiles table. Role-gating dependencies enforce the same access
model as the database RLS policies.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Optional

import httpx
import jwt as pyjwt
from fastapi import Depends, HTTPException, Request, status

from .config import get_settings
from .supabase_service import get_physique_role, lookup_profile


@dataclass
class AuthUser:
    uid: str
    email: Optional[str]
    user_type: Optional[str]
    role: Optional[str]  # 'athlete' | 'coach' | 'admin' | None


def _bearer_token(request: Request) -> Optional[str]:
    header = request.headers.get("Authorization", "")
    if not header:
        return None
    parts = header.split(" ", 1)
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1].strip()
    return None


def _verify_local(token: str, settings) -> dict:
    """Verify HS256 Supabase JWT locally with the configured secret."""
    payload = pyjwt.decode(
        token,
        settings.supabase_jwt_secret,
        algorithms=["HS256"],
        audience="authenticated",
        options={"require": ["exp", "sub"]},
    )
    return payload


def _verify_remote(token: str, settings) -> dict:
    """Verify token via Supabase Auth user endpoint (no local secret needed)."""
    url = f"{settings.supabase_url}/auth/v1/user"
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": settings.supabase_anon_key,
    }
    with httpx.Client(timeout=10.0) as client:
        resp = client.get(url, headers=headers)
    if resp.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    data = resp.json()
    return {"sub": data.get("id"), "email": data.get("email")}


def get_current_user(request: Request) -> AuthUser:
    token = _bearer_token(request)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization bearer token")

    settings = get_settings()
    try:
        if settings.has_jwt_secret:
            claims = _verify_local(token, settings)
        else:
            claims = _verify_remote(token, settings)
    except pyjwt.PyJWTError:
        # Local verification failed — try remote as a fallback (e.g. audience mismatch).
        try:
            claims = _verify_remote(token, settings)
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Auth error: {exc}")

    uid = claims.get("sub")
    if not uid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing subject")

    # Resolve Ada2Physique role from profiles (service-role lookup).
    try:
        profile = lookup_profile(uid)
        user_type = (profile or {}).get("user_type")
        email = (profile or {}).get("email") or claims.get("email")
    except Exception:
        # If service-role is unavailable, fall back to JWT email only.
        user_type = None
        email = claims.get("email")

    role = user_type if user_type in ("athlete", "coach", "admin") else None
    return AuthUser(uid=uid, email=email, user_type=user_type, role=role)


def require_athlete(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    if user.role != "athlete":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Athlete access required")
    return user


def require_coach(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    if user.role != "coach":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Coach access required")
    return user


def require_admin(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


def require_coach_or_athlete(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    if user.role not in ("athlete", "coach"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Athlete or coach access required")
    return user
