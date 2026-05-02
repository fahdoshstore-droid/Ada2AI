// Standard API response wrapper
export interface ApiResponse<T> {
  success: true;
  data: T;
  error: null;
}

export interface ApiError {
  success: false;
  data: null;
  error: {
    message: string;
    code: string;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// Enums
export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';
export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

// Player types (Frontend format - camelCase)
export interface Player {
  id: number;
  name: string;
  age: number | null;
  team: string | null;
  position: Position | null;
  photoUrl: string | null;
  jerseyNumber: number | null;
  nationality: string | null;
  dominantFoot: string | null;
  createdAt: string;
}

// Match types
export interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  venue: string | null;
  footageUrl: string | null;
  scoreHome: number;
  scoreAway: number;
  competition: string | null;
  season: string | null;
  status: MatchStatus;
  createdAt: string;
}

// Analysis types
export interface Analysis {
  id: number;
  playerId: number;
  matchId: number;
  totalDistanceKm: number;
  topSpeedKmh: number;
  avgSpeedKmh: number;
  sprintCount: number;
  passAccuracy: number;
  shotCount: number;
  shotsOnTarget: number;
  goals: number;
  assists: number;
  tackles: number;
  interceptions: number;
  duelsWon: number;
  duelsLost: number;
  heatmapData: string | null;
  matchRating: number;
  aiSummary: string | null;
  videoClips: string[];
  createdAt: string;
}

// Analysis submission type
export interface AnalysisSubmit {
  playerId: number;
  matchId: number;
  totalDistanceKm: number;
  topSpeedKmh: number;
  avgSpeedKmh: number;
  sprintCount: number;
  passAccuracy: number;
  shotCount: number;
  shotsOnTarget: number;
  goals: number;
  assists: number;
  tackles: number;
  interceptions: number;
  duelsWon: number;
  duelsLost: number;
  heatmapData?: string;
  videoClips?: string[];
}

// Scout types
export interface Scout {
  id: number;
  name: string;
  nameAr: string | null;
  sport: string;
  region: string | null;
  rating: number;
  academyName: string | null;
  createdAt: string;
}

// Backend SportID types (snake_case - internal)
export interface SportIdPlayer {
  player_id: number;
  full_name: string;
  age: number | null;
  current_team: string | null;
  primary_position: Position | null;
  photo_url: string | null;
  jersey_number: number | null;
  nationality: string | null;
  dominant_foot: string | null;
  created_at: string;
}

export interface SportIdMatch {
  match_id: number;
  home_team_name: string;
  away_team_name: string;
  match_datetime: string;
  venue_name: string | null;
  footage_url: string | null;
  home_score: number;
  away_score: number;
  competition_name: string | null;
  season_name: string | null;
  match_status: MatchStatus;
  created_at: string;
}

export interface SportIdAnalysis {
  analysis_id: number;
  player_id: number;
  match_id: number;
  total_distance_km: number;
  top_speed_kmh: number;
  avg_speed_kmh: number;
  sprint_count: number;
  pass_accuracy: number;
  shot_count: number;
  shots_on_target: number;
  goals: number;
  assists: number;
  tackles: number;
  interceptions: number;
  duels_won: number;
  duels_lost: number;
  heatmap_data: string | null;
  match_rating: number;
  ai_summary: string | null;
  video_clip_urls: string[];
  created_at: string;
}

// Express/Supabase backend types (snake_case - internal)
export interface ExpressPlayer {
  id: number;
  name: string;
  age: number | null;
  team: string | null;
  position: Position | null;
  photo_url: string | null;
  jersey_number: number | null;
  nationality: string | null;
  dominant_foot: string | null;
  created_at: string;
}

export interface ExpressMatch {
  id: number;
  home_team: string;
  away_team: string;
  match_date: string;
  venue: string | null;
  footage_url: string | null;
  score_home: number;
  score_away: number;
  competition: string | null;
  season: string | null;
  status: MatchStatus;
  created_at: string;
}

export interface ExpressScout {
  id: number;
  name: string;
  name_ar: string | null;
  sport: string;
  region: string | null;
  rating: number;
  academy_name: string | null;
  created_at: string;
}
