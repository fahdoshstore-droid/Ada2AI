"""
SportID API Routes for Ada2AI
Players, Matches, Analysis, Sport Passport endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/sportid", tags=["SportID"])

# ============================================================
# Pydantic Models
# ============================================================

class PlayerCreate(BaseModel):
    name: str
    age: Optional[int] = None
    team: Optional[str] = None
    position: Optional[str] = None  # GK, DEF, MID, FWD
    photo_url: Optional[str] = None
    jersey_number: Optional[int] = None
    nationality: Optional[str] = None
    dominant_foot: Optional[str] = None

class PlayerResponse(BaseModel):
    id: int
    name: str
    age: Optional[int]
    team: Optional[str]
    position: Optional[str]
    photo_url: Optional[str]
    jersey_number: Optional[int]
    nationality: Optional[str]
    dominant_foot: Optional[str]
    created_at: str

class MatchCreate(BaseModel):
    home_team: str
    away_team: str
    match_date: str  # ISO format
    venue: Optional[str] = None
    footage_url: Optional[str] = None
    competition: Optional[str] = None
    season: Optional[str] = None

class MatchResponse(BaseModel):
    id: int
    home_team: str
    away_team: str
    match_date: str
    venue: Optional[str]
    footage_url: Optional[str]
    score_home: int
    score_away: int
    competition: Optional[str]
    season: Optional[str]
    status: str
    created_at: str

class AnalyzeRequest(BaseModel):
    player_id: int
    match_id: int
    # Physical
    total_distance_km: Optional[float] = 0
    top_speed_kmh: Optional[float] = 0
    avg_speed_kmh: Optional[float] = 0
    sprint_count: Optional[int] = 0
    # Performance
    pass_accuracy: Optional[float] = 0
    shot_count: Optional[int] = 0
    shots_on_target: Optional[int] = 0
    goals: Optional[int] = 0
    assists: Optional[int] = 0
    tackles: Optional[int] = 0
    interceptions: Optional[int] = 0
    duels_won: Optional[int] = 0
    duels_lost: Optional[int] = 0
    heatmap_data: Optional[list] = []
    video_clips: Optional[list] = []

class AnalysisResponse(BaseModel):
    id: int
    player_id: int
    match_id: int
    total_distance_km: float
    top_speed_kmh: float
    avg_speed_kmh: float
    sprint_count: int
    pass_accuracy: float
    shot_count: int
    goals: int
    assists: int
    tackles: int
    match_rating: float
    ai_summary: Optional[str]
    video_clips: list
    created_at: str

class SportPassportResponse(BaseModel):
    player_id: int
    player_name: str
    team: Optional[str]
    position: Optional[str]
    overall_score: float
    pace_score: float
    shooting_score: float
    passing_score: float
    dribbling_score: float
    defending_score: float
    physical_score: float
    total_matches: int
    total_goals: int
    total_assists: int
    avg_distance_per_match_km: float
    avg_rating: float
    strengths: list
    weaknesses: list
    recommendations: list
    development_plan: Optional[str]
    last_updated: str

# ============================================================
# Database Helper (SQLite for dev, swap to PostgreSQL for prod)
# ============================================================

import sqlite3
import json
import os

DB_PATH = os.environ.get("SPORTID_DB", "sportid.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    """Initialize database with schema."""
    conn = get_db()
    schema_path = os.path.join(os.path.dirname(__file__), "sportid_schema.sql")
    if os.path.exists(schema_path):
        # Read and adapt for SQLite
        with open(schema_path) as f:
            sql = f.read()
        # Convert PostgreSQL to SQLite
        sql = sql.replace("SERIAL PRIMARY KEY", "INTEGER PRIMARY KEY AUTOINCREMENT")
        sql = sql.replace("JSONB", "TEXT")
        sql = sql.replace("TIMESTAMP DEFAULT CURRENT_TIMESTAMP", "TEXT DEFAULT CURRENT_TIMESTAMP")
        sql = sql.replace("FLOAT DEFAULT", "REAL DEFAULT")
        # Remove PostgreSQL-specific
        for line in sql.split('\n'):
            line = line.strip()
            if line and not line.startswith('--') and not line.startswith('CREATE INDEX'):
                pass
        conn.executescript(sql)
    else:
        # Inline schema for SQLite
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL, age INTEGER, team TEXT, position TEXT,
                photo_url TEXT, jersey_number INTEGER, nationality TEXT,
                dominant_foot TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS matches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                home_team TEXT NOT NULL, away_team TEXT NOT NULL,
                match_date TEXT NOT NULL, venue TEXT, footage_url TEXT,
                score_home INTEGER DEFAULT 0, score_away INTEGER DEFAULT 0,
                competition TEXT, season TEXT, status TEXT DEFAULT 'scheduled',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
                match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
                total_distance_km REAL DEFAULT 0, top_speed_kmh REAL DEFAULT 0,
                avg_speed_kmh REAL DEFAULT 0, sprint_count INTEGER DEFAULT 0,
                pass_accuracy REAL DEFAULT 0, shot_count INTEGER DEFAULT 0,
                shots_on_target INTEGER DEFAULT 0, goals INTEGER DEFAULT 0,
                assists INTEGER DEFAULT 0, tackles INTEGER DEFAULT 0,
                interceptions INTEGER DEFAULT 0, duels_won INTEGER DEFAULT 0,
                duels_lost INTEGER DEFAULT 0, heatmap_data TEXT DEFAULT '[]',
                video_clips TEXT DEFAULT '[]', ai_summary TEXT,
                match_rating REAL DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(player_id, match_id)
            );
            CREATE TABLE IF NOT EXISTS sport_passports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id INTEGER UNIQUE REFERENCES players(id) ON DELETE CASCADE,
                overall_score REAL DEFAULT 0, pace_score REAL DEFAULT 0,
                shooting_score REAL DEFAULT 0, passing_score REAL DEFAULT 0,
                dribbling_score REAL DEFAULT 0, defending_score REAL DEFAULT 0,
                physical_score REAL DEFAULT 0, total_matches INTEGER DEFAULT 0,
                total_goals INTEGER DEFAULT 0, total_assists INTEGER DEFAULT 0,
                avg_distance_per_match_km REAL DEFAULT 0, avg_rating REAL DEFAULT 0,
                strengths TEXT DEFAULT '[]', weaknesses TEXT DEFAULT '[]',
                recommendations TEXT DEFAULT '[]', development_plan TEXT,
                last_updated TEXT DEFAULT CURRENT_TIMESTAMP, passport_version INTEGER DEFAULT 1
            );
        """)
    conn.commit()
    conn.close()

# Auto-init on import
init_db()

# ============================================================
# API Routes
# ============================================================

@router.post("/players", response_model=PlayerResponse, status_code=201)
async def create_player(player: PlayerCreate):
    """Create a new player in the SportID system."""
    conn = get_db()
    try:
        cur = conn.execute(
            """INSERT INTO players (name, age, team, position, photo_url, 
               jersey_number, nationality, dominant_foot) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (player.name, player.age, player.team, player.position,
             player.photo_url, player.jersey_number, player.nationality,
             player.dominant_foot)
        )
        conn.commit()
        row = conn.execute("SELECT * FROM players WHERE id = ?", (cur.lastrowid,)).fetchone()
        return dict(row)
    finally:
        conn.close()

@router.get("/players", response_model=List[PlayerResponse])
async def list_players(team: Optional[str] = None, position: Optional[str] = None):
    """List all players, optionally filtered by team or position."""
    conn = get_db()
    try:
        query = "SELECT * FROM players WHERE 1=1"
        params = []
        if team:
            query += " AND team = ?"
            params.append(team)
        if position:
            query += " AND position = ?"
            params.append(position)
        query += " ORDER BY created_at DESC"
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

@router.get("/players/{player_id}", response_model=PlayerResponse)
async def get_player(player_id: int):
    """Get a specific player by ID."""
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM players WHERE id = ?", (player_id,)).fetchone()
        if not row:
            raise HTTPException(404, f"Player {player_id} not found")
        return dict(row)
    finally:
        conn.close()

@router.post("/matches", response_model=MatchResponse, status_code=201)
async def create_match(match: MatchCreate):
    """Create a new match record."""
    conn = get_db()
    try:
        cur = conn.execute(
            """INSERT INTO matches (home_team, away_team, match_date, venue,
               footage_url, competition, season) VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (match.home_team, match.away_team, match.match_date,
             match.venue, match.footage_url, match.competition, match.season)
        )
        conn.commit()
        row = conn.execute("SELECT * FROM matches WHERE id = ?", (cur.lastrowid,)).fetchone()
        return dict(row)
    finally:
        conn.close()

@router.get("/matches", response_model=List[MatchResponse])
async def list_matches(
    team: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 20
):
    """List matches, optionally filtered."""
    conn = get_db()
    try:
        query = "SELECT * FROM matches WHERE 1=1"
        params = []
        if team:
            query += " AND (home_team = ? OR away_team = ?)"
            params.extend([team, team])
        if status:
            query += " AND status = ?"
            params.append(status)
        query += " ORDER BY match_date DESC LIMIT ?"
        params.append(limit)
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

@router.post("/analyze/player", response_model=AnalysisResponse, status_code=201)
async def analyze_player_match(analysis: AnalyzeRequest):
    """
    Submit or update analysis for a player in a specific match.
    Calculates match rating automatically from metrics.
    """
    conn = get_db()
    try:
        # Verify player & match exist
        player = conn.execute("SELECT id FROM players WHERE id = ?", (analysis.player_id,)).fetchone()
        match = conn.execute("SELECT id FROM matches WHERE id = ?", (analysis.match_id,)).fetchone()
        if not player:
            raise HTTPException(404, f"Player {analysis.player_id} not found")
        if not match:
            raise HTTPException(404, f"Match {analysis.match_id} not found")

        # Calculate match rating (weighted formula)
        rating = (
            analysis.goals * 1.5 +
            analysis.assists * 1.2 +
            analysis.pass_accuracy * 0.03 +
            analysis.tackles * 0.2 +
            analysis.interceptions * 0.15 +
            (analysis.top_speed_kmh / 40) * 0.5 +
            (analysis.total_distance_km / 12) * 0.5
        )
        rating = min(max(round(rating, 1), 1.0), 10.0)

        # Generate AI summary placeholder
        summary = f"Match analysis for Player #{analysis.player_id}: {analysis.goals}G {analysis.assists}A, "
        summary += f"{analysis.total_distance_km:.1f}km covered, {analysis.top_speed_kmh:.1f}km/h top speed. "
        summary += f"Rating: {rating}/10"

        # Upsert analysis
        conn.execute("""
            INSERT INTO analyses (player_id, match_id, total_distance_km, top_speed_kmh,
                avg_speed_kmh, sprint_count, pass_accuracy, shot_count, shots_on_target,
                goals, assists, tackles, interceptions, duels_won, duels_lost,
                heatmap_data, video_clips, ai_summary, match_rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(player_id, match_id) DO UPDATE SET
                total_distance_km=excluded.total_distance_km,
                top_speed_kmh=excluded.top_speed_kmh,
                goals=excluded.goals, assists=excluded.assists,
                match_rating=excluded.match_rating,
                ai_summary=excluded.ai_summary,
                video_clips=excluded.video_clips
        """, (
            analysis.player_id, analysis.match_id,
            analysis.total_distance_km, analysis.top_speed_kmh,
            analysis.avg_speed_kmh, analysis.sprint_count,
            analysis.pass_accuracy, analysis.shot_count,
            analysis.shots_on_target, analysis.goals, analysis.assists,
            analysis.tackles, analysis.interceptions,
            analysis.duels_won, analysis.duels_lost,
            json.dumps(analysis.heatmap_data or []),
            json.dumps(analysis.video_clips or []),
            summary, rating
        ))
        conn.commit()

        row = conn.execute(
            "SELECT * FROM analyses WHERE player_id = ? AND match_id = ?",
            (analysis.player_id, analysis.match_id)
        ).fetchone()
        result = dict(row)
        # Parse JSON fields back to list
        result["heatmap_data"] = json.loads(result.get("heatmap_data") or "[]")
        result["video_clips"] = json.loads(result.get("video_clips") or "[]")
        return result
    finally:
        conn.close()

@router.get("/sport-passport/{player_id}", response_model=SportPassportResponse)
async def get_sport_passport(player_id: int):
    """
    Generate/return Sport Passport for a player.
    Aggregates all analyses into a comprehensive player profile.
    """
    conn = get_db()
    try:
        player = conn.execute("SELECT * FROM players WHERE id = ?", (player_id,)).fetchone()
        if not player:
            raise HTTPException(404, f"Player {player_id} not found")

        analyses = conn.execute(
            "SELECT * FROM analyses WHERE player_id = ?", (player_id,)
        ).fetchall()

        if not analyses:
            # Return empty passport
            return SportPassportResponse(
                player_id=player_id, player_name=player["name"],
                team=player["team"], position=player["position"],
                overall_score=0, pace_score=0, shooting_score=0,
                passing_score=0, dribbling_score=0, defending_score=0,
                physical_score=0, total_matches=0, total_goals=0,
                total_assists=0, avg_distance_per_match_km=0, avg_rating=0,
                strengths=[], weaknesses=[], recommendations=[],
                development_plan=None, last_updated=datetime.now().isoformat()
            )

        # Aggregate stats
        total_matches = len(analyses)
        total_goals = sum(a["goals"] for a in analyses)
        total_assists = sum(a["assists"] for a in analyses)
        avg_distance = sum(a["total_distance_km"] for a in analyses) / total_matches
        avg_rating = sum(a["match_rating"] for a in analyses) / total_matches

        # Calculate category scores (0-100)
        pace_score = min(100, (sum(a["top_speed_kmh"] for a in analyses) / total_matches) / 35 * 100)
        shooting_score = min(100, ((total_goals / total_matches) / 1.5) * 100)
        passing_score = min(100, sum(a["pass_accuracy"] for a in analyses) / total_matches)
        defending_score = min(100, ((sum(a["tackles"] + a["interceptions"] for a in analyses) / total_matches) / 8) * 100)
        physical_score = min(100, (avg_distance / 11) * 100)
        dribbling_score = min(100, ((sum(a["duels_won"] for a in analyses) / max(1, sum(a["duels_won"] + a["duels_lost"] for a in analyses))) * 100))

        # Overall score (weighted)
        overall_score = (
            pace_score * 0.15 + shooting_score * 0.20 + passing_score * 0.20 +
            dribbling_score * 0.15 + defending_score * 0.15 + physical_score * 0.15
        )

        # Generate AI recommendations based on scores
        strengths = []
        weaknesses = []
        recommendations = []

        if pace_score > 70: strengths.append("Excellent pace and speed")
        elif pace_score < 40: weaknesses.append("Pace needs improvement"); recommendations.append("Add sprint interval training 3x/week")

        if shooting_score > 70: strengths.append("Strong finishing ability")
        elif shooting_score < 40: weaknesses.append("Low goal conversion"); recommendations.append("Practice finishing drills daily")

        if passing_score > 80: strengths.append("Outstanding passing accuracy")
        elif passing_score < 50: weaknesses.append("Pass accuracy below average"); recommendations.append("Focus on short-pass precision exercises")

        if defending_score > 70: strengths.append("Solid defensive contribution")
        if physical_score > 75: strengths.append("Excellent physical stamina")
        elif physical_score < 50: weaknesses.append("Low endurance levels"); recommendations.append("Build aerobic base with long-distance runs")

        if avg_rating >= 8: strengths.append("Consistently high match ratings")
        elif avg_rating < 5: weaknesses.append("Match ratings need improvement")

        dev_plan = f"Player {player['name']} - Development Plan:\n"
        dev_plan += f"Matches analyzed: {total_matches}\n"
        dev_plan += f"Key focus: {recommendations[0] if recommendations else 'Maintain current level'}"

        # Upsert passport
        conn.execute("""
            INSERT INTO sport_passports (player_id, overall_score, pace_score, shooting_score,
                passing_score, dribbling_score, defending_score, physical_score,
                total_matches, total_goals, total_assists, avg_distance_per_match_km,
                avg_rating, strengths, weaknesses, recommendations, development_plan)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(player_id) DO UPDATE SET
                overall_score=excluded.overall_score,
                pace_score=excluded.pace_score,
                total_matches=excluded.total_matches,
                last_updated=CURRENT_TIMESTAMP
        """, (
            player_id, round(overall_score, 1), round(pace_score, 1),
            round(shooting_score, 1), round(passing_score, 1),
            round(dribbling_score, 1), round(defending_score, 1),
            round(physical_score, 1), total_matches, total_goals,
            total_assists, round(avg_distance, 2), round(avg_rating, 1),
            json.dumps(strengths), json.dumps(weaknesses),
            json.dumps(recommendations), dev_plan
        ))
        conn.commit()

        return SportPassportResponse(
            player_id=player_id, player_name=player["name"],
            team=player["team"], position=player["position"],
            overall_score=round(overall_score, 1),
            pace_score=round(pace_score, 1),
            shooting_score=round(shooting_score, 1),
            passing_score=round(passing_score, 1),
            dribbling_score=round(dribbling_score, 1),
            defending_score=round(defending_score, 1),
            physical_score=round(physical_score, 1),
            total_matches=total_matches, total_goals=total_goals,
            total_assists=total_assists,
            avg_distance_per_match_km=round(avg_distance, 2),
            avg_rating=round(avg_rating, 1),
            strengths=strengths, weaknesses=weaknesses,
            recommendations=recommendations,
            development_plan=dev_plan,
            last_updated=datetime.now().isoformat()
        )
    finally:
        conn.close()

@router.get("/players/{player_id}/analyses", response_model=List[AnalysisResponse])
async def get_player_analyses(player_id: int, limit: int = 10):
    """Get all analyses for a player."""
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT * FROM analyses WHERE player_id = ? ORDER BY created_at DESC LIMIT ?",
            (player_id, limit)
        ).fetchall()
        results = []
        for r in rows:
            d = dict(r)
            d["heatmap_data"] = json.loads(d.get("heatmap_data") or "[]")
            d["video_clips"] = json.loads(d.get("video_clips") or "[]")
            results.append(d)
        return results
    finally:
        conn.close()

@router.get("/dashboard")
async def dashboard():
    """Quick stats overview."""
    conn = get_db()
    try:
        players = conn.execute("SELECT COUNT(*) as c FROM players").fetchone()["c"]
        matches = conn.execute("SELECT COUNT(*) as c FROM matches").fetchone()["c"]
        analyses = conn.execute("SELECT COUNT(*) as c FROM analyses").fetchone()["c"]
        passports = conn.execute("SELECT COUNT(*) as c FROM sport_passports").fetchone()["c"]
        return {
            "total_players": players,
            "total_matches": matches,
            "total_analyses": analyses,
            "active_passports": passports
        }
    finally:
        conn.close()
