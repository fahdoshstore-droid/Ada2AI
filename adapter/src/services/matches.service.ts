import { SportIdClient } from '../clients/sportid.client.js';
import { MatchesMapper } from '../mappers/matches.mapper.js';
import type { Match } from '../types/index.js';

export class MatchesService {
  private sportIdClient: SportIdClient;

  constructor() {
    this.sportIdClient = new SportIdClient();
  }

  async getMatches(filters?: { team?: string; status?: string; limit?: number }): Promise<{ matches: Match[] }> {
    const matches = await this.sportIdClient.getMatches(filters);
    return { matches: MatchesMapper.fromBackendArray(matches) };
  }

  async getMatchById(id: number): Promise<Match> {
    const match = await this.sportIdClient.getMatchById(id);
    return MatchesMapper.fromBackend(match);
  }
}