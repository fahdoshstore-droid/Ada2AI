import axios, { AxiosInstance, isAxiosError } from 'axios';
import type { ExpressPlayer, ExpressMatch, SportIdAnalysis, AnalysisSubmit } from '../types/index.js';

export class SportIdClient {
  private client: AxiosInstance;

  constructor(baseUrl: string = process.env.SPORTID_BACKEND_URL || 'https://unnotational-gus-unsenescent.ngrok-free.dev') {
    this.client = axios.create({
      baseURL: `${baseUrl}/sportid`,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Players - backend returns ExpressPlayer format (name, team, position)
  async getPlayers(filters?: { team?: string; position?: string }): Promise<ExpressPlayer[]> {
    const params = new URLSearchParams();
    if (filters?.team) params.append('team', filters.team);
    if (filters?.position) params.append('position', filters.position);
    const queryString = params.toString();
    const url = queryString ? `/players?${queryString}` : '/players';
    const response = await this.client.get(url);
    return response.data;
  }

  async getPlayerById(id: number): Promise<ExpressPlayer> {
    const response = await this.client.get(`/players/${id}`);
    return response.data;
  }

  // Matches - backend returns ExpressMatch format
  async getMatches(filters?: { team?: string; status?: string; limit?: number }): Promise<ExpressMatch[]> {
    const params = new URLSearchParams();
    if (filters?.team) params.append('team', filters.team);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', String(filters.limit));
    const queryString = params.toString();
    const url = queryString ? `/matches?${queryString}` : '/matches';
    const response = await this.client.get(url);
    return response.data;
  }

  async getMatchById(id: number): Promise<ExpressMatch> {
    const response = await this.client.get(`/matches/${id}`);
    return response.data;
  }

  // Analysis
  async getAnalyses(): Promise<SportIdAnalysis[]> {
    const response = await this.client.get('/analysis');
    return response.data;
  }

  async getAnalysisById(id: number): Promise<SportIdAnalysis> {
    const response = await this.client.get(`/analysis/${id}`);
    return response.data;
  }

  async getAnalysesByPlayerId(playerId: number, limit?: number): Promise<SportIdAnalysis[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));
    const queryString = params.toString();
    const url = queryString ? `/players/${playerId}/analyses?${queryString}` : `/players/${playerId}/analyses`;
    const response = await this.client.get(url);
    return response.data;
  }

  async submitAnalysis(data: AnalysisSubmit): Promise<SportIdAnalysis> {
    const payload = {
      player_id: data.playerId,
      match_id: data.matchId,
      total_distance_km: data.totalDistanceKm,
      top_speed_kmh: data.topSpeedKmh,
      avg_speed_kmh: data.avgSpeedKmh,
      sprint_count: data.sprintCount,
      pass_accuracy: data.passAccuracy,
      shot_count: data.shotCount,
      shots_on_target: data.shotsOnTarget,
      goals: data.goals,
      assists: data.assists,
      tackles: data.tackles,
      interceptions: data.interceptions,
      duels_won: data.duelsWon,
      duels_lost: data.duelsLost,
      heatmap_data: data.heatmapData,
      video_clips: data.videoClips,
    };
    const response = await this.client.post('/analyze/player', payload);
    return response.data;
  }

  // Scouts
  async getScouts(): Promise<any[]> {
    const response = await this.client.get('/scouts');
    return response.data;
  }

  async getScoutById(id: number): Promise<any> {
    const response = await this.client.get(`/scouts/${id}`);
    return response.data;
  }

  // Check if error is a network error
  isNetworkError(error: unknown): boolean {
    return isAxiosError(error) && !error.response;
  }
}