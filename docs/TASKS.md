# Ada2AI v2 — Implementation Task List

**Architecture Reference:** ARCHITECTURE_V2_FINAL.md v1.0 + ACR-001  
**Date:** 25 June 2026  
**Target:** Codex (OpenAI)  
**Supabase Project:** `ujjmhqpyehymaavkawiv`

---

## Task Dependency Graph

```
TASK-001 (profiles + triggers)
  └── TASK-002 (academies, scouts, players, waitlist)
        └── TASK-003 (matches, analyses)
              └── TASK-004 (seed data)
                    └── TASK-005 (naming fixes — code)
                          └── TASK-006 (deploy + verify)

Phase 2 (after Pilot verified):
  TASK-007 (organizations, evaluations, coach_players)
    └── TASK-008 (trainings, facilities)
          └── TASK-009 (match_stats, ministry_stats, point_transactions)
```

---

## Pilot Tasks

### TASK-001 — Migration 001: Authentication & Identity

**Status:** PENDING  
**Depends on:** None  
**Estimated files:** 1 SQL migration file

**Deliverables:**
1. `profiles` table — 12 columns per Section 3.1
2. `handle_new_user()` function — auto-creates profile on signup
3. `on_auth_user_created` trigger — AFTER INSERT ON `auth.users`
4. `update_updated_at()` function — reusable timestamp updater
5. RLS policies for `profiles`:
   - `profiles_select_own` — `auth.uid() = id`
   - `profiles_insert_own` — `auth.uid() = id`
   - `profiles_update_own` — `auth.uid() = id`
   - `profiles_service_role` — `auth.role() = 'service_role'`
6. `trg_profiles_updated_at` trigger — BEFORE UPDATE ON `profiles`

**Verification:**
- [ ] `profiles` table exists in Supabase
- [ ] New user signup auto-creates profile row
- [ ] `anon` key cannot read other users' profiles
- [ ] `service_role` key can read all profiles

---

### TASK-002 — Migration 002: Core Directories

**Status:** PENDING  
**Depends on:** TASK-001  
**Estimated files:** 1 SQL migration file

**Deliverables:**

**2a. `academies` table — 20 columns per Section 3.3**
- Indexes: `idx_academies_sport_region`, `idx_academies_verified_active`
- RLS: `academies_select_public` (true), `academies_insert_auth`, `academies_update_own`, `academies_delete_own`, `academies_service_role`

**2b. `scouts` table — 19 columns per Section 3.4**
- Indexes: `idx_scouts_sport_region`, `idx_scouts_verified`
- RLS: `scouts_select_public` (true), `scouts_insert_auth`, `scouts_update_own`, `scouts_delete_own`, `scouts_service_role`

**2c. `players` table — 44 columns per Section 3.2 (updated by ACR-001)**
- **CRITICAL:** Include `region` column (ACR-001 B2)
- Indexes: `idx_players_sport_region_active`, `idx_players_rating`, `idx_players_scout_discovery`, `idx_players_academy`, `idx_players_name_search` (GIN trigram)
- RLS: `players_select_public` (true), `players_insert_auth`, `players_update_own`, `players_delete_own`, `players_service_role`

**2d. `waitlist` table — 7 columns per Section 3.5**
- Index: `idx_waitlist_email` (UNIQUE)
- RLS: `waitlist_insert_public` (true), `waitlist_service_role`

**Verification:**
- [ ] All 4 tables exist in Supabase
- [ ] Public can SELECT from players, academies, scouts
- [ ] Public can INSERT into waitlist
- [ ] Authenticated users can INSERT into players, academies, scouts
- [ ] `players.region` column exists and is queryable

---

### TASK-003 — Migration 003: Matches & Analysis

**Status:** PENDING  
**Depends on:** TASK-002  
**Estimated files:** 1 SQL migration file

**Deliverables:**

**3a. `matches` table — 13 columns per Section 3.7**
- Index: `idx_matches_date`
- RLS: `matches_select_public` (true), `matches_insert_auth`, `matches_update_auth`, `matches_delete_auth`, `matches_service_role`

**3b. `analyses` table — 14 columns per Section 3.6**
- **CRITICAL:** Table name is `analyses` (plural) — NOT `analysis` (ACR-001 B3)
- Index: `idx_analyses_player_date`
- RLS: `analyses_select_own`, `analyses_insert_auth`, `analyses_update_own`, `analyses_delete_own`, `analyses_service_role`

**Verification:**
- [ ] `matches` table exists with public SELECT
- [ ] `analyses` table exists (plural name)
- [ ] `analyses.player_id` FK → `players.id`
- [ ] `analyses.match_id` FK → `matches.id` (nullable)

---

### TASK-004 — Migration 004: Seed Data

**Status:** PENDING  
**Depends on:** TASK-003  
**Estimated files:** 1 SQL migration file

**Deliverables:**

**4a. 10 Academies** (real Saudi academies)
- Al-Hilal Academy (Riyadh, Football, rating 4.8)
- Al-Ittihad Academy (Jeddah, Football, rating 4.7)
- Al-Ahli Academy (Jeddah, Football, rating 4.6)
- Al-Nassr Academy (Riyadh, Football, rating 4.5)
- Al-Shabab Academy (Riyadh, Football, rating 4.3)
- Al-Ettifaq Academy (Dammam, Football, rating 4.2)
- Al-Fateh Academy (Al-Hasa, Football, rating 4.1)
- Saudi Basketball Federation Academy (Riyadh, Basketball, rating 4.4)
- Saudi Aquatics Academy (Riyadh, Swimming, rating 4.3)
- Eastern Province Athletics Academy (Dammam, Athletics, rating 4.0)

**4b. 10 Players** (with realistic Saudi names, ratings 65-92, varied sports)
- Include: `name` (Arabic), `name_en`, `sport`, `position`, `age`, `region`, `rating`, `speed`, `agility`, `technique`, `stamina`, `badge`, `badge_color`, `academy_id`, `academy_name`
- At least 2 players per academy
- At least 2 sports (Football + Basketball)

**4c. 6 Scouts** (with organizations, specialities)
- Include: `name` (Arabic), `name_en`, `organization`, `sport`, `region`, `speciality`, `experience_years`, `rating`, `verified`

**4d. 6 Matches** (Saudi league fixtures)
- Include: `home_team`, `away_team`, `home_score`, `away_score`, `score`, `result`, `competition`, `match_date`, `season`, `venue`, `is_completed`

**Verification:**
- [ ] `SELECT count(*) FROM academies` = 10
- [ ] `SELECT count(*) FROM players` = 10
- [ ] `SELECT count(*) FROM scouts` = 6
- [ ] `SELECT count(*) FROM matches` = 6
- [ ] All players have valid `academy_id` FK
- [ ] All players have `region` populated

---

### TASK-005 — Code-Side Naming Fixes (ACR-001)

**Status:** PENDING  
**Depends on:** TASK-004  
**Estimated files:** ~30 files

**Deliverables:**

**5a. `name_ar` → `name` (B1) — ~30 files**

API layer (`api/`):
- [ ] `api/players.ts:37` — search: `name_ar.ilike` → `name_en.ilike`
- [ ] `api/players.ts:48,50` — insert: remove `name_ar` from destructure and insert
- [ ] `api/academies.ts:37` — search: `name_ar.ilike` → `name_en.ilike`
- [ ] `api/academies.ts:48,50` — insert: remove `name_ar`
- [ ] `api/scouts.ts:37` — search: `name_ar.ilike` → `name_en.ilike`
- [ ] `api/scouts.ts:48,50` — insert: remove `name_ar`
- [ ] `api/players/route.ts:39` — select: `name_ar` → `name_en`
- [ ] `api/players/route.ts:68,76` — insert: remove `name_ar`

Server layer (`server/`):
- [ ] `server/apiPlayers.ts:24` — search: `name_ar.ilike` → `name_en.ilike`
- [ ] `server/apiPlayers.ts:75,80` — insert: remove `name_ar`
- [ ] `server/apiScouts.ts:23` — search: `name_ar.ilike` → `name_en.ilike`
- [ ] `server/apiScouts.ts:74,79` — insert: remove `name_ar`
- [ ] `server/apiAcademies.ts:23` — search: `name_ar.ilike` → `name_en.ilike`
- [ ] `server/apiAcademies.ts:74,79` — insert: remove `name_ar`
- [ ] `server/_core/rag/intents.ts:57,83,110,137,163,167` — all `name_ar.ilike` → `name_en.ilike`

Client layer (`client/src/`):
- [ ] `client/src/pages/Players.tsx:13,58` — `name_ar` → `name`
- [ ] `client/src/pages/Scouts.tsx:14,79,261` — `name_ar` → `name`
- [ ] `client/src/pages/Academies.tsx:12,71,301` — `name_ar` → `name`
- [ ] `client/src/pages/dashboard/ScoutDashboard.tsx:75,368,648` — `name_ar` → `name`
- [ ] `client/src/pages/dashboard/ParentDashboard.tsx:24` — `name_ar` → `name`
- [ ] `client/src/pages/TrainingHub.tsx:230,232` — `name_ar` → `name`
- [ ] `client/src/hooks/useScoutPlayers.ts:21,125` — `name_ar` → `name`
- [ ] `client/src/pages/dashboard/coach/types.ts:18` — `name_ar` → `name`

**5b. Facilities camelCase → snake_case (B4) — 2 files**
- [ ] `api/facilities.ts:27-81` — mock data: `nameAr` → `name_en`, `managerId` → `manager_id`, `monthlyRevenue` → `monthly_revenue`, `activeAthletes` → `active_athletes`
- [ ] `api/facilities.ts:134,136` — insert: same renames
- [ ] `server/apiFacilities.ts:7-73` — mock data: same renames

**5c. Trainings camelCase → snake_case (B5) — 2 files**
- [ ] `api/trainings.ts:45,47` — `titleEn` → `title_en`, `maxAttendance` → `max_attendance`
- [ ] `server/apiTrainings.ts:38` — same renames

**5d. `athleteId` → `player_id` (B6) — 1 file**
- [ ] `server/apiAthletePoints.ts:44` — `.eq('athleteId', ...)` → `.eq('player_id', ...)`

**5e. `analysis` → `analyses` (B3) — 1 file**
- [ ] `api/sportid/route.ts:86` — `.from('analysis')` → `.from('analyses')`

**Verification:**
- [ ] `grep -r "name_ar" api/ server/ client/src/` returns ZERO results (except comments)
- [ ] `grep -r "nameAr\|managerId\|monthlyRevenue\|activeAthletes\|titleEn\|maxAttendance\|athleteId" api/ server/` returns ZERO results
- [ ] `grep -r "\.from('analysis')" api/` returns ZERO results
- [ ] TypeScript build passes with 0 errors
- [ ] All existing tests pass

---

### TASK-006 — Deploy & Verify Pilot

**Status:** PENDING  
**Depends on:** TASK-005  
**Estimated files:** 0 (operations only)

**Deliverables:**

**6a. Supabase**
- [ ] All 4 migrations applied to `ujjmhqpyehymaavkawiv`
- [ ] All tables visible in Supabase Dashboard
- [ ] RLS policies active on all tables

**6b. Vercel Deploy**
- [ ] `cd Ada2AI && vercel --prod`
- [ ] All Pilot endpoints return 200 (not 500, not 404)

**6c. Endpoint Verification**

| Endpoint | Expected | Actual |
|---|---|---|
| `GET /api/players` | 200 + data | |
| `GET /api/players?sport=football&region=Riyadh` | 200 + filtered | |
| `GET /api/academies` | 200 + data | |
| `GET /api/scouts` | 200 + data | |
| `GET /api/matches` | 200 + data | |
| `POST /api/waitlist` | 201 | |
| `POST /api/analyze` | 200 (with valid image) | |
| `GET /` | 200 (SPA shell) | |
| `GET /players` | 200 (SPA page) | |
| `GET /academies` | 200 (SPA page) | |
| `GET /scouts` | 200 (SPA page) | |

**6d. Frontend Verification**
- [ ] Player cards display Arabic names correctly
- [ ] Region filter works on Players page
- [ ] Academy filter works on Players page
- [ ] Scout directory shows verified scouts
- [ ] Upload page accepts images
- [ ] Analysis results display correctly

---

## Phase 2 Tasks

### TASK-007 — Migration 005: Organizations & Coaching

**Status:** PENDING  
**Depends on:** TASK-006 (Pilot verified)  
**Estimated files:** 1 SQL migration + ~5 code files

**Deliverables:**

**7a. `organizations` table — 16 columns per Section 3.8**
- Indexes: `idx_organizations_type`, `idx_organizations_region`
- RLS: `organizations_select_public`, `organizations_insert_auth`, `organizations_update_own`, `organizations_delete_own`, `organizations_service_role`

**7b. `evaluations` table — 11 columns per Section 3.9**
- Index: `idx_evaluations_player_date`
- RLS: `evaluations_select_own`, `evaluations_insert_auth`, `evaluations_update_own`, `evaluations_delete_own`, `evaluations_service_role`

**7c. `coach_players` table — 5 columns per Section 3.11**
- UNIQUE on `(coach_id, player_id)`
- Indexes: `idx_coach_players_coach`, `idx_coach_players_player`, `idx_coach_players_unique`
- RLS: `coach_players_select_own`, `coach_players_insert_auth`, `coach_players_update_own`, `coach_players_delete_own`, `coach_players_service_role`

**7d. Code — API endpoints**
- [ ] `POST /api/evaluations` — create evaluation (auto-compute overall)
- [ ] `GET /api/evaluations?player_id=` — list evaluations
- [ ] `POST /api/coach-players` — assign player to coach
- [ ] `GET /api/coach-players?coach_id=` — list coach's players

**Verification:**
- [ ] Coach can create evaluation for assigned player
- [ ] Evaluation `overall` is auto-computed correctly
- [ ] Coach can view only their own players
- [ ] Duplicate coach-player assignment is rejected

---

### TASK-008 — Migration 006: Training & Facilities

**Status:** PENDING  
**Depends on:** TASK-007  
**Estimated files:** 1 SQL migration + ~4 code files

**Deliverables:**

**8a. `trainings` table — 10 columns per Section 3.12**
- Indexes: `idx_trainings_date`, `idx_trainings_coach_date`
- RLS: `trainings_select_own`, `trainings_insert_auth`, `trainings_update_own`, `trainings_delete_own`, `trainings_service_role`

**8b. `facilities` table — 11 columns per Section 3.13**
- Indexes: `idx_facilities_region`, `idx_facilities_sports` (GIN)
- RLS: `facilities_select_public`, `facilities_insert_auth`, `facilities_update_own`, `facilities_delete_own`, `facilities_service_role`

**8c. Code — API endpoints**
- [ ] `POST /api/trainings` — schedule training
- [ ] `GET /api/trainings` — list trainings (coach's own)
- [ ] `GET /api/facilities` — list facilities (public, with filters)
- [ ] `PATCH /api/trainings/:id/attendance` — toggle player attendance

**Verification:**
- [ ] Coach can create training with date/time
- [ ] Training attendance is stored as JSON array of player UUIDs
- [ ] Facilities are publicly searchable by region and sport
- [ ] GIN index on `facilities.sports` works for array contains queries

---

### TASK-009 — Migration 007: Ministry & Points

**Status:** PENDING  
**Depends on:** TASK-008  
**Estimated files:** 1 SQL migration + ~4 code files

**Deliverables:**

**9a. `match_stats` table — 16 columns per Section 3.10**
- Indexes: `idx_match_stats_player`, `idx_match_stats_match`
- RLS: `match_stats_select_public`, `match_stats_insert_auth`, `match_stats_update_auth`, `match_stats_delete_auth`, `match_stats_service_role`

**9b. `ministry_stats` table — 14 columns per Section 3.14**
- RLS: `ministry_stats_select_service`, `ministry_stats_insert_service`, `ministry_stats_update_service`, `ministry_stats_service_role`

**9c. `point_transactions` table — 8 columns per Section 3.15**
- Index: `idx_point_transactions_player_date`
- RLS: `point_transactions_select_own` (via player's profile_id), `point_transactions_insert_service`, `point_transactions_service_role`

**9d. Code — API endpoints**
- [ ] `GET /api/ministry/kpi` — ministry dashboard (service_role only)
- [ ] `GET /api/athletes/:id/points` — point history
- [ ] `GET /api/athletes/:id/career` — aggregated career (rewrite from `career_history` to live aggregation)
- [ ] `POST /api/match-stats` — record match statistics

**Verification:**
- [ ] Ministry KPI endpoint returns singleton stats
- [ ] Point transactions are created automatically on session/competition/certification
- [ ] Career endpoint aggregates from `point_transactions` + `evaluations` + `analyses`
- [ ] `career_history` table does NOT exist (dead architecture confirmed)

---

## Task Summary

| Task | Phase | Migration | Tables | Code Files | Status |
|---|---|---|---|---|---|
| TASK-001 | Pilot | 001 | 1 | 0 | PENDING |
| TASK-002 | Pilot | 002 | 4 | 0 | PENDING |
| TASK-003 | Pilot | 003 | 2 | 0 | PENDING |
| TASK-004 | Pilot | 004 | 0 (seed) | 0 | PENDING |
| TASK-005 | Pilot | — | 0 | ~30 | PENDING |
| TASK-006 | Pilot | — | 0 | 0 (ops) | PENDING |
| TASK-007 | Phase 2 | 005 | 3 | ~5 | PENDING |
| TASK-008 | Phase 2 | 006 | 2 | ~4 | PENDING |
| TASK-009 | Phase 2 | 007 | 3 | ~4 | PENDING |

**Total: 9 tasks, 7 migrations, 15 tables, ~43 code files**

---

## Implementation Order

```
Day 1: TASK-001 → TASK-002 → TASK-003 (migrations 001-003)
Day 2: TASK-004 (seed data) → TASK-005 (naming fixes)
Day 3: TASK-006 (deploy + verify) → Pilot LIVE
--- PILOT VERIFIED ---
Day 4: TASK-007 (organizations + coaching)
Day 5: TASK-008 (training + facilities)
Day 6: TASK-009 (ministry + points) → Phase 2 COMPLETE
```

---

*Tasks are sequential within each phase. No task may begin before its dependencies are verified complete.*
