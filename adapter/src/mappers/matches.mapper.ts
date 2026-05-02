import type { Match, ExpressMatch } from '../types/index.js';

export class MatchesMapper {
  static fromBackend(source: ExpressMatch): Match {
    return {
      id: source.id,
      homeTeam: source.home_team,
      awayTeam: source.away_team,
      matchDate: source.match_date,
      venue: source.venue,
      footageUrl: source.footage_url,
      scoreHome: source.score_home,
      scoreAway: source.score_away,
      competition: source.competition,
      season: source.season,
      status: source.status,
      createdAt: source.created_at,
    };
  }

  static fromBackendArray(sources: ExpressMatch[]): Match[] {
    return sources.map((source) => this.fromBackend(source));
  }
}