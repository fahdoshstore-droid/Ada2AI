# PLAYER SCHEMA UNIFICATION REPORT — Ada2AI Connect Sprint

**Date:** 2026-06-10

---

## Schema Conflict

Two player table definitions exist:

### Schema A: Migration 003 (`supabase/migrations/003_add_players_academies_scouts.sql`)
```
id, user_id, name, name_ar, sport, position, age, region, rating, speed, agility, technique, stamina, badge, badge_color, academy_id, academy_name, avatar_url, bio, is_active, created_at, updated_at
```

### Schema B: Canonical (`supabase-schema.sql`)
```
id, user_id, profile_id, position, age, height_cm, weight_kg, dominant_foot, jersey_number, achievements, video_url, stats (JSONB), is_active, created_at, updated_at
```

## Resolution: Schema A is CANONICAL

Migration 003 is the actual deployed schema. Schema B is a design document that was never deployed.

**Evidence:**
- Migration 003 has seed data (8 players with Arabic names)
- RLS policies reference columns from Schema A (`rating`, `speed`, etc.)
- `CoachDashboard` and `Rankings` query Schema A columns (`is_active`, `rating`)
- `PlayerDashboard` now queries Schema A columns

**Canonical player type (TypeScript adapter):**

```typescript
interface Player {
  id: string
  user_id: string | null
  name: string
  name_ar: string | null
  sport: string
  position: string | null
  age: number | null
  region: string | null
  rating: number          // 0-100
  speed: number           // 0-100
  agility: number         // 0-100
  technique: number       // 0-100
  stamina: number         // 0-100
  badge: string | null
  badge_color: string
  academy_id: string | null
  academy_name: string | null
  avatar_url: string | null
  bio: string | null
  is_active: boolean
}
```

## Adapter Created

PlayerDashboard.tsx now uses this canonical schema via `PlayerData` interface matching the actual database columns.

## Backend Intelligence Mapping

IntelligenceBridge uses `track_id` (integer) — NOT `player.id` (UUID).
Mapping: `track_id` from YOLO tracking → `player` record in Supabase via position/team matching.

This mapping is intentionally loose — YOLO doesn't know player UUIDs, it tracks by visual appearance. Future: manual player identification UI.

## Action Items

1. ✅ Remove Schema B from `supabase-schema.sql` — it's misleading
2. ✅ PlayerDashboard uses Schema A columns
3. ⚠️ Server `POST /api/players` still uses different fields — needs alignment (next sprint)

## Status: PLAYER SCHEMA — UNIFIED ON SCHEMA A