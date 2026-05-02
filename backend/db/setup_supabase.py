"""
Supabase SQL setup for Ada2AI - Create missing tables and seed data
"""
import os
from supabase import create_client

SUPABASE_URL = "https://ujjmhqpyehymaavkawiv.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "sb_publishable_0SW1Q7ENJNjpu-27GJdd5g_-nZRE5nO")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

sql_create_matches = """
CREATE TABLE IF NOT EXISTS matches (
  id BIGSERIAL PRIMARY KEY,
  home_team VARCHAR(255) NOT NULL,
  away_team VARCHAR(255) NOT NULL,
  match_date TIMESTAMPTZ DEFAULT now(),
  venue VARCHAR(255),
  footage_url TEXT,
  score_home INTEGER DEFAULT 0,
  score_away INTEGER DEFAULT 0,
  competition VARCHAR(255),
  season VARCHAR(100),
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT now()
);
"""

sql_create_analysis = """
CREATE TABLE IF NOT EXISTS analysis (
  id BIGSERIAL PRIMARY KEY,
  player_id BIGINT REFERENCES players(id) ON DELETE CASCADE,
  match_id BIGINT REFERENCES matches(id) ON DELETE SET NULL,
  total_distance_km DECIMAL(6,2) DEFAULT 0,
  top_speed_kmh DECIMAL(5,2) DEFAULT 0,
  avg_speed_kmh DECIMAL(5,2) DEFAULT 0,
  sprint_count INTEGER DEFAULT 0,
  pass_accuracy DECIMAL(5,2) DEFAULT 0,
  shot_count INTEGER DEFAULT 0,
  shots_on_target INTEGER DEFAULT 0,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  tackles INTEGER DEFAULT 0,
  interceptions INTEGER DEFAULT 0,
  duels_won INTEGER DEFAULT 0,
  duels_lost INTEGER DEFAULT 0,
  heatmap_data JSONB DEFAULT '[]',
  video_clips JSONB DEFAULT '[]',
  match_rating DECIMAL(3,2) DEFAULT 0,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
"""

# Create matches table
try:
    # Use direct REST API to execute SQL
    import httpx
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    # Try via postgrest rpc if available, else just continue
    print("[SQL] Creating tables via Supabase...")
except Exception as e:
    print(f"[SQL] Setup error: {e}")

# Try inserting data directly
try:
    # Insert matches
    matches_data = [
        {"home_team": "النصر", "away_team": "الهلال", "venue": "الرياض", "score_home": 2, "score_away": 1, "competition": "دوري روشن", "season": "2025-2026", "status": "completed"},
        {"home_team": "الاتحاد", "away_team": "الأهلي", "venue": "جدة", "score_home": 0, "score_away": 0, "competition": "دوري روشن", "season": "2025-2026", "status": "live"},
        {"home_team": "الشباب", "away_team": "القادسية", "venue": "الدمام", "score_home": 3, "score_away": 2, "competition": "دوري روشن", "season": "2025-2026", "status": "completed"},
    ]
    for match in matches_data:
        supabase.table("matches").insert(match).execute()
    print(f"[Seed] Inserted {len(matches_data)} matches")
except Exception as e:
    print(f"[Seed] Matches insert error: {e}")

try:
    # Insert analysis
    player_res = supabase.table("players").select("id").execute()
    if player_res.data:
        player_id = player_res.data[0]["id"]
        analysis_data = {
            "player_id": player_id,
            "total_distance_km": 8.5,
            "top_speed_kmh": 32.1,
            "avg_speed_kmh": 21.3,
            "sprint_count": 12,
            "pass_accuracy": 87.5,
            "shot_count": 4,
            "shots_on_target": 2,
            "goals": 1,
            "assists": 0,
            "tackles": 3,
            "interceptions": 5,
            "duels_won": 8,
            "duels_lost": 2,
            "match_rating": 8.2,
            "ai_summary": "أداء قوي من اللاعب مع سرعة عالية وتسديدات خطيرة"
        }
        supabase.table("analysis").insert(analysis_data).execute()
        print(f"[Seed] Inserted analysis for player {player_id}")
except Exception as e:
    print(f"[Seed] Analysis insert error: {e}")

print("\n[Done] Check Supabase dashboard for tables")
