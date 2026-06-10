# SECURITY LOCKDOWN REPORT — Ada2AI

**Date:** 2026-06-10 | **Status:** LOCKED DOWN

---

## Changes Made

### 1. Auth Middleware (`backend/auth_middleware.py`)
- **NEW FILE** — Centralized authentication, NO duplicate auth in routes
- Default mode: `PILOT_MODE=closed` (all routes require auth except public)
- Token verification: `PILOT_TOKEN` env var or `SUPABASE_ANON_KEY` (transition)
- Unauthorized access logging: `AUTH_DENIED` events with IP + path
- Public routes: `/`, `/health`, `/config` only

### 2. Route Protection Matrix

| Route | Before | After |
|---|---|---|
| `/`, `/health`, `/config` | Open | **Public** (intentionally open) |
| `/analyze/*` | Open | **Pilot auth required** |
| `/intelligence/*` | Open | **Pilot auth required** |
| `/detect/*` | Open | **Pilot auth required** |
| SportID sub-router | Open | **Pilot auth required** (via middleware) |

### 3. Vercel API Route Auth (`api/players/route.ts`, `api/sportid/route.ts`)
- **BEFORE:** Zero auth on GET/POST — anyone could read/write DB
- **AFTER:** `verifyAuth()` function added — requires Bearer token
- Accepts `PILOT_TOKEN` or `SUPABASE_ANON_KEY` for transition period

### 4. Unauthorized Access Logging
- All denied requests logged: `AUTH_DENIED method=X path=Y ip=Z`
- Structured JSON format via `ada2ai.auth` logger

---

## How to Use

### Start backend in closed mode (default):
```bash
PILOT_TOKEN=your-secret-token python3 main.py
```

### Start backend in dev mode (auth disabled):
```bash
PILOT_MODE=disabled python3 main.py
```

### Frontend requests:
```typescript
fetch('/api/...', {
  headers: { 'Authorization': 'Bearer your-secret-token' }
})
```

---

## Backward Compatibility
- ✅ Existing functionality preserved
- ✅ CORS still works
- ✅ Public health endpoints still accessible
- ✅ `PILOT_MODE=disabled` restores open access for dev
- ✅ Supabase anon key accepted as token during transition