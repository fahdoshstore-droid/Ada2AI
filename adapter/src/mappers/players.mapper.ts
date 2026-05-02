import type { Player, ExpressPlayer } from '../types/index.js';

export class PlayersMapper {
  // Backend returns ExpressPlayer format: name, team, position (NOT full_name, current_team)
  static fromExpress(source: ExpressPlayer): Player {
    return {
      id: source.id,
      name: source.name,
      age: source.age,
      team: source.team,
      position: source.position,
      photoUrl: source.photo_url,
      jerseyNumber: source.jersey_number,
      nationality: source.nationality,
      dominantFoot: source.dominant_foot,
      createdAt: source.created_at,
    };
  }

  static fromExpressArray(sources: ExpressPlayer[]): Player[] {
    return sources.map((source) => this.fromExpress(source));
  }
}