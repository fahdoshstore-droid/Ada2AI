-- Ada2AI Schema Migration — ALTER existing tables
-- The `users` table already exists with: id, email, full_name, role, sport, created_at, updated_at
-- The `profiles` table already exists with: id, email, full_name, role, user_type, phone, avatar_url, sport, region, city, is_active, created_at, updated_at
-- The `waitlist` table does NOT exist yet
-- 
-- Strategy: Add missing columns to `users` for our code requirements,
--           Create `waitlist` table,
--           Add RLS policies for both tables

-- ══════════════════════════════════════════════════════════════════
-- USERS TABLE — Add missing columns
-- ══════════════════════════════════════════════════════════════════

-- Add open_id column (required by OAuth flow — unique identifier from Manus/auth provider)
ALTER TABLE users ADD COLUMN IF NOT EXISTS open_id VARCHAR(64);
-- Make open_id unique and NOT NULL (for existing rows, set a placeholder first)
UPDATE users SET open_id = id::text WHERE open_id IS NULL;
ALTER TABLE users ALTER COLUMN open_id SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_open_id_unique UNIQUE (open_id);

-- Add name column (maps from login/display name)
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;

-- Add login_method column (tracks OAuth provider: email, google, apple, etc.)
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_method VARCHAR(64);

-- Add last_signed_in column (timestamp of last authentication)
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_signed_in TIMESTAMPTZ;

-- Add is_active column (soft delete / account status)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Drop old role constraint if exists and add new one allowing 'user' and 'admin'
-- First check if old constraint exists
DO $$
DECLARE
  _constraint_name TEXT;
BEGIN
  SELECT con.conname INTO _constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE rel.relname = 'users'
    AND con.contype = 'c'
    AND nsp.nspname = 'public';

  IF _constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE users DROP CONSTRAINT %I', _constraint_name);
  END IF;
END $$;

ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));

-- Create index for fast lookups by open_id
CREATE INDEX IF NOT EXISTS idx_users_open_id ON users (open_id);

-- ══════════════════════════════════════════════════════════════════
-- AUTO-UPDATE updated_at TRIGGER
-- ══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ══════════════════════════════════════════════════════════════════
-- WAITLIST TABLE — Create from scratch
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  role VARCHAR(32) NOT NULL CHECK (role IN ('athlete', 'scout', 'coach', 'academy', 'federation', 'other')),
  sport VARCHAR(100),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist (email);

-- ══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════════════

-- Enable RLS on both tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Service role full access on users" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Service role full access on waitlist" ON waitlist;
DROP POLICY IF EXISTS "Service role full access on profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile in profiles" ON profiles;

-- Service role has full access (used by server-side API)
CREATE POLICY "Service role full access on users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on waitlist" ON waitlist
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users can read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "Users can read own profile in profiles" ON profiles
  FOR SELECT USING (auth.uid() = id OR auth.role() = 'service_role');

-- ══════════════════════════════════════════════════════════════════
-- SYNC PROFILES → USERS (optional: create users from existing profiles)
-- ══════════════════════════════════════════════════════════════════

-- Migrate existing profiles into users table (idempotent — skips if already matched)
INSERT INTO users (id, open_id, email, full_name, role, sport, is_active, created_at, updated_at)
SELECT
  p.id,
  p.id::text AS open_id,  -- Use id as open_id placeholder until real OAuth login
  p.email,
  p.full_name,
  p.role,
  p.sport,
  COALESCE(p.is_active, true),
  p.created_at,
  p.updated_at
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.id = p.id
)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- MIGRATION NOTES
-- ══════════════════════════════════════════════════════════════════
-- Running order:
-- 1. Run this migration in Supabase SQL Editor
-- 2. The `users` table gets: open_id, name, login_method, last_signed_in, is_active
-- 3. The `waitlist` table is created fresh
-- 4. Existing `profiles` data is copied into `users`
-- 5. RLS policies are set for all three tables
-- 6. After migration, the app reads/writes to `users` table via db.ts