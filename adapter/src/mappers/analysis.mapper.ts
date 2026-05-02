import type { Analysis, SportIdAnalysis } from '../types/index.js';

export class AnalysisMapper {
  static fromSportId(source: SportIdAnalysis): Analysis {
    return {
      id: source.analysis_id,
      playerId: source.player_id,
      matchId: source.match_id,
      totalDistanceKm: source.total_distance_km,
      topSpeedKmh: source.top_speed_kmh,
      avgSpeedKmh: source.avg_speed_kmh,
      sprintCount: source.sprint_count,
      passAccuracy: source.pass_accuracy,
      shotCount: source.shot_count,
      shotsOnTarget: source.shots_on_target,
      goals: source.goals,
      assists: source.assists,
      tackles: source.tackles,
      interceptions: source.interceptions,
      duelsWon: source.duels_won,
      duelsLost: source.duels_lost,
      heatmapData: source.heatmap_data,
      matchRating: source.match_rating,
      aiSummary: source.ai_summary,
      videoClips: source.video_clip_urls,
      createdAt: source.created_at,
    };
  }

  static fromSportIdArray(sources: SportIdAnalysis[]): Analysis[] {
    return sources.map((source) => this.fromSportId(source));
  }
}
