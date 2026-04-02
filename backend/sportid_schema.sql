-- ============================================
-- SportID Database Schema for Ada2AI
-- ============================================

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INTEGER,
    team VARCHAR(100),
    position VARCHAR(50),  -- GK, DEF, MID, FWD
    photo_url TEXT,
    jersey_number INTEGER,
    nationality VARCHAR(100),
    dominant_foot VARCHAR(10),  -- left, right, both
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    match_date TIMESTAMP NOT NULL,
    venue VARCHAR(200),
    footage_url TEXT,
    score_home INTEGER DEFAULT 0,
    score_away INTEGER DEFAULT 0,
    competition VARCHAR(100),
    season VARCHAR(20),
    status VARCHAR(20) DEFAULT 'scheduled',  -- scheduled, live, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analysis table - per player per match
CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
    -- Physical metrics
    total_distance_km FLOAT DEFAULT 0,
    top_speed_kmh FLOAT DEFAULT 0,
    avg_speed_kmh FLOAT DEFAULT 0,
    sprint_count INTEGER DEFAULT 0,
    -- Performance metrics
    pass_accuracy FLOAT DEFAULT 0,        -- percentage
    shot_count INTEGER DEFAULT 0,
    shots_on_target INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    tackles INTEGER DEFAULT 0,
    interceptions INTEGER DEFAULT 0,
    duels_won INTEGER DEFAULT 0,
    duels_lost INTEGER DEFAULT 0,
    -- Positional data (JSON)
    heatmap_data JSONB DEFAULT '[]',
    -- Video clips references
    video_clips JSONB DEFAULT '[]',  -- [{url, event_type, timestamp}]
    -- AI-generated summary
    ai_summary TEXT,
    -- Overall match rating (1-10)
    match_rating FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, match_id)
);

-- Sport Passport - aggregated player profile
CREATE TABLE IF NOT EXISTS sport_passports (
    id SERIAL PRIMARY KEY,
    player_id INTEGER UNIQUE REFERENCES players(id) ON DELETE CASCADE,
    -- Overall scores
    overall_score FLOAT DEFAULT 0,          -- 0-100
    pace_score FLOAT DEFAULT 0,
    shooting_score FLOAT DEFAULT 0,
    passing_score FLOAT DEFAULT 0,
    dribbling_score FLOAT DEFAULT 0,
    defending_score FLOAT DEFAULT 0,
    physical_score FLOAT DEFAULT 0,
    -- Stats aggregation
    total_matches INTEGER DEFAULT 0,
    total_goals INTEGER DEFAULT 0,
    total_assists INTEGER DEFAULT 0,
    avg_distance_per_match_km FLOAT DEFAULT 0,
    avg_rating FLOAT DEFAULT 0,
    -- AI Recommendations
    strengths JSONB DEFAULT '[]',          -- ["High work rate", "Good positioning"]
    weaknesses JSONB DEFAULT '[]',         -- ["Needs improvement in aerial duels"]
    recommendations JSONB DEFAULT '[]',    -- ["Focus on sprint recovery drills"]
    development_plan TEXT,
    -- Meta
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    passport_version INTEGER DEFAULT 1
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analyses_player ON analyses(player_id);
CREATE INDEX IF NOT EXISTS idx_analyses_match ON analyses(match_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON matches(home_team, away_team);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team);
CREATE INDEX IF NOT EXISTS idx_passports_player ON sport_passports(player_id);
