import { SportIdClient } from '../clients/sportid.client.js';
import { AnalysisMapper } from '../mappers/analysis.mapper.js';
import type { Analysis, AnalysisSubmit } from '../types/index.js';
import { ErrorCodes } from '../utils/errors.js';

export class AnalysisService {
  private sportIdClient: SportIdClient;

  constructor() {
    this.sportIdClient = new SportIdClient();
  }

  async getAnalyses(): Promise<{ analyses: Analysis[] }> {
    const analyses = await this.sportIdClient.getAnalyses();
    return { analyses: AnalysisMapper.fromSportIdArray(analyses) };
  }

  async getAnalysisById(id: number): Promise<Analysis> {
    const analysis = await this.sportIdClient.getAnalysisById(id);
    return AnalysisMapper.fromSportId(analysis);
  }

  async getAnalysesByPlayerId(playerId: number): Promise<{ analyses: Analysis[] }> {
    const analyses = await this.sportIdClient.getAnalysesByPlayerId(playerId);
    return { analyses: AnalysisMapper.fromSportIdArray(analyses) };
  }

  async submitAnalysis(data: AnalysisSubmit): Promise<{ analysis: Analysis }> {
    const analysis = await this.sportIdClient.submitAnalysis(data);
    return { analysis: AnalysisMapper.fromSportId(analysis) };
  }
}
