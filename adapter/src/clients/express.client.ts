import axios, { AxiosInstance } from 'axios';
import type { ExpressPlayer, ExpressMatch, ExpressScout, Position, MatchStatus } from '../types/index.js';

export class ExpressClient {
  private client: AxiosInstance;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Players
  async getPlayers(): Promise<ExpressPlayer[]> {
    const response = await this.client.get('/players');
    return response.data;
  }

  async getPlayerById(id: number): Promise<ExpressPlayer> {
    const response = await this.client.get(`/players/${id}`);
    return response.data;
  }

  // Matches
  async getMatches(): Promise<ExpressMatch[]> {
    const response = await this.client.get('/matches');
    return response.data;
  }

  async getMatchById(id: number): Promise<ExpressMatch> {
    const response = await this.client.get(`/matches/${id}`);
    return response.data;
  }

  // Scouts
  async getScouts(): Promise<ExpressScout[]> {
    const response = await this.client.get('/scouts');
    return response.data;
  }

  async getScoutById(id: number): Promise<ExpressScout> {
    const response = await this.client.get(`/scouts/${id}`);
    return response.data;
  }
}
