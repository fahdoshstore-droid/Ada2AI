-- Ada2AI Unified Schema Migration
-- Migrates from MySQL/Drizzle to Supabase (PostgreSQL)
-- Run this in Supabase SQL Editor

-- ═══════════════════════════════════════════
-- USERS TABLE (replaces MySQL `users` table)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  open_id VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  login_method VARCHAR(64),
  role VARCHAR(16) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  last_signed_in TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast lookups by open_id
CREATE INDEX IF NOT EXISTS idx_users_open_id ON users (open_id);

-- Auto-update updated_at on row change
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

-- ═══════════════════════════════════════════
-- WAITLIST TABLE (replaces MySQL `waitlist` table)
-- ═══════════════════════════════════════════
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

-- ═══════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Service role has full access (used by server-side API)
CREATE POLICY "Service role full access on users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on waitlist" ON waitlist
  FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users can read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid()::text = open_id OR auth.role() = 'service_role');

-- ═══════════════════════════════════════════
-- MIGRATION NOTES
-- ═══════════════════════════════════════════
-- To migrate existing MySQL data:
-- 1. Export users table from MySQL
-- 2. Transform openId column → open_id
-- 3. Transform loginMethod → login_method  
-- 4. Transform lastSignedIn → last_signed_in
-- 5. Transform createdAt → created_at
-- 6. Transform updatedAt → updated_at
-- 7. Import via Supabase SQL Editor or pg_dump
