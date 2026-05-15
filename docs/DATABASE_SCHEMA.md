# Ada2AI — Database Schema

**Canonical source**: `supabase-schema.sql` in the repo root.
**Supabase project**: `ujjmhqpyehymaavkawiv`

---

## profiles

The central user table, 1:1 with `auth.users`. Created automatically by the `handle_new_user` trigger on signup.

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() |
| user_id | UUID | NOT NULL, UNIQUE, FK → auth.users(id) ON DELETE CASCADE |
| user_type | TEXT | NOT NULL, CHECK IN ('player','club','coach','parent','scout','academy') |
| full_name | TEXT | |
| email | TEXT | |
| phone | TEXT | |
| avatar_url | TEXT | |
| sport | TEXT | |
| region | TEXT | |
| city | TEXT | |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes**: `idx_profiles_user_id`, `idx_profiles_user_type`, `idx_profiles_sport`, `idx_profiles_email`, `idx_profiles_created_at`

**RLS policies**:
- `profiles_select_own` — SELECT where `auth.uid() = id` OR service_role
- `profiles_insert_own` — INSERT where `auth.uid() = id` OR service_role
- `profiles_update_own` — UPDATE where `auth.uid() = id` OR service_role
- `profiles_service_role` — ALL for service_role

---

## players

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() |
| user_id | UUID | FK → profiles(id) ON DELETE SET NULL |
| profile_id | UUID | FK → profiles(id) ON DELETE CASCADE |
| position | TEXT | |
| age | INT | |
| height_cm | INT | |
| weight_kg | INT | |
| dominant_foot | TEXT | CHECK IN ('left','right','both') |
| jersey_number | INT | |
| achievements | TEXT | |
| video_url | TEXT | |
| stats | JSONB | DEFAULT '{}' |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes**: `idx_players_user_id`, `idx_players_profile_id`, `idx_players_position`, `idx_players_sport_region`, `idx_players_rating`

**RLS**: Public SELECT; owner INSERT/UPDATE/DELETE (`auth.uid() = user_id`); service_role ALL

---

## academies

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() |
| user_id | UUID | FK → profiles(id) ON DELETE SET NULL |
| name | VARCHAR(255) | NOT NULL |
| name_ar | VARCHAR(255) | |
| sport | VARCHAR(100) | NOT NULL, DEFAULT 'Football' |
| region | VARCHAR(100) | |
| city | VARCHAR(100) | |
| description | TEXT | |
| description_ar | TEXT | |
| logo_url | TEXT | |
| cover_url | TEXT | |
| website_url | TEXT | |
| phone | VARCHAR(50) | |
| email | VARCHAR(255) | |
| verified | BOOLEAN | DEFAULT false |
| rating | NUMERIC(3,2) | DEFAULT 0, CHECK 0–5 |
| player_count | INTEGER | DEFAULT 0 |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes**: `idx_academies_user_id`, `idx_academies_sport_region`, `idx_academies_verified_active`

**RLS**: Public SELECT; owner INSERT/UPDATE/DELETE; service_role ALL

---

## scouts

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() |
| user_id | UUID | FK → profiles(id) ON DELETE SET NULL |
| name | VARCHAR(255) | NOT NULL |
| name_ar | VARCHAR(255) | |
| organization | VARCHAR(255) | |
| organization_ar | VARCHAR(255) | |
| sport | VARCHAR(100) | NOT NULL, DEFAULT 'Football' |
| region | VARCHAR(100) | |
| speciality | VARCHAR(100) | |
| experience_years | INTEGER | DEFAULT 0 |
| verified | BOOLEAN | DEFAULT false |
| rating | NUMERIC(3,2) | DEFAULT 0, CHECK 0–5 |
| reports_count | INTEGER | DEFAULT 0 |
| avatar_url | TEXT | |
| bio | TEXT | |
| bio_ar | TEXT | |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes**: `idx_scouts_user_id`, `idx_scouts_sport_region`, `idx_scouts_verified`

**RLS**: Public SELECT; owner INSERT/UPDATE/DELETE; service_role ALL

---

## clubs

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() |
| profile_id | UUID | NOT NULL, FK → profiles(id) ON DELETE CASCADE |
| club_name | TEXT | NOT NULL |
| league | TEXT | |
| founded_year | INT | |
| stadium | TEXT | |
| website | TEXT | |
| description | TEXT | |
| logo_url | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes**: `idx_clubs_profile_id`

**RLS**: Enabled (service_role access)

---

## coaches

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() |
| profile_id | UUID | NOT NULL, FK → profiles(id) ON DELETE CASCADE |
| certification | TEXT | |
| specialization | TEXT | |
| years_experience | INT | |
| previous_teams | TEXT | |
| coaching_license | TEXT | |
| achievements | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes**: `idx_coaches_profile_id`

**RLS**: Enabled (service_role access)

---

## parents

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() |
| profile_id | UUID | NOT NULL, FK → profiles(id) ON DELETE CASCADE |
| children | JSONB | DEFAULT '[]' |
| emergency_contact | TEXT | |
| relationship | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes**: `idx_parents_profile_id`

**RLS**: Enabled (service_role access)

---

## waitlist

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(320) | NOT NULL, UNIQUE |
| role | VARCHAR(32) | NOT NULL, CHECK IN ('athlete','scout','coach','academy','federation','other') |
| sport | VARCHAR(100) | |
| message | TEXT | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

**Indexes**: `idx_waitlist_email`

**RLS**: Public INSERT; service_role ALL

---

## Triggers

- **`on_auth_user_created`** (AFTER INSERT on `auth.users`) → calls `handle_new_user()` — auto-creates a `profiles` row with `id`, `email`, `full_name`, `user_type` from the signup metadata
- **`trg_profiles_updated_at`** (BEFORE UPDATE on `profiles`) → calls `update_updated_at()` — sets `updated_at = NOW()`