-- Migration 005: RLS for unprotected tables
-- Tables: matches, analysis, trainings, facilities, evaluations, match_stats
-- SAFE: Adds policies only. Does NOT drop existing data or schemas.

-- ═══ matches ═══
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matches_select_authenticated" ON matches
  FOR SELECT USING (true);  -- public read for authenticated users (frontend needs this)

CREATE POLICY "matches_insert_admin" ON matches
  FOR INSERT WITH CHECK (false);  -- deny public insert — use setup script only

CREATE POLICY "matches_update_admin" ON matches
  FOR UPDATE USING (false);  -- deny public update

CREATE POLICY "matches_delete_admin" ON matches
  FOR DELETE USING (false);  -- deny public delete

-- ═══ analysis ═══
ALTER TABLE analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analysis_select_authenticated" ON analysis
  FOR SELECT USING (true);  -- public read

CREATE POLICY "analysis_insert_admin" ON analysis
  FOR INSERT WITH CHECK (false);  -- deny public insert

CREATE POLICY "analysis_update_admin" ON analysis
  FOR UPDATE USING (false);

CREATE POLICY "analysis_delete_admin" ON analysis
  FOR DELETE USING (false);

-- ═══ trainings ═══
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trainings_select_authenticated" ON trainings
  FOR SELECT USING (true);

CREATE POLICY "trainings_insert_admin" ON trainings
  FOR INSERT WITH CHECK (false);

CREATE POLICY "trainings_update_admin" ON trainings
  FOR UPDATE USING (false);

CREATE POLICY "trainings_delete_admin" ON trainings
  FOR DELETE USING (false);

-- ═══ facilities ═══
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "facilities_select_authenticated" ON facilities
  FOR SELECT USING (true);

CREATE POLICY "facilities_insert_admin" ON facilities
  FOR INSERT WITH CHECK (false);

CREATE POLICY "facilities_update_admin" ON facilities
  FOR UPDATE USING (false);

CREATE POLICY "facilities_delete_admin" ON facilities
  FOR DELETE USING (false);

-- ═══ evaluations ═══
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evaluations_select_authenticated" ON evaluations
  FOR SELECT USING (true);

CREATE POLICY "evaluations_insert_admin" ON evaluations
  FOR INSERT WITH CHECK (false);

CREATE POLICY "evaluations_update_admin" ON evaluations
  FOR UPDATE USING (false);

CREATE POLICY "evaluations_delete_admin" ON evaluations
  FOR DELETE USING (false);

-- ═══ match_stats ═══
ALTER TABLE match_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "match_stats_select_authenticated" ON match_stats
  FOR SELECT USING (true);

CREATE POLICY "match_stats_insert_admin" ON match_stats
  FOR INSERT WITH CHECK (false);

CREATE POLICY "match_stats_update_admin" ON match_stats
  FOR UPDATE USING (false);

CREATE POLICY "match_stats_delete_admin" ON match_stats
  FOR DELETE USING (false);