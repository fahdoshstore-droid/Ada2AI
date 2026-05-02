import { ExpressClient } from '../clients/express.client.js';
import type { Scout, ApiResult } from '../types/index.js';
import { ErrorCodes } from '../utils/errors.js';

export class ScoutService {
  private expressClient: ExpressClient;

  constructor() {
    this.expressClient = new ExpressClient();
  }

  async getAllScouts(): Promise<ApiResult<Scout[]>> {
    try {
      const scouts = await this.expressClient.getScouts();
      // Map from Express format to frontend format (already camelCase in ExpressPlayer-like format)
      const mapped: Scout[] = scouts.map((s) => ({
        id: s.id,
        name: s.name,
        nameAr: s.name_ar,
        sport: s.sport,
        region: s.region,
        rating: s.rating,
        academyName: s.academy_name,
        createdAt: s.created_at,
      }));
      return { success: true, data: mapped, error: null };
    } catch (error) {
      return { success: false, data: null, error: { message: 'Failed to fetch scouts', code: ErrorCodes.BACKEND_ERROR } };
    }
  }

  async getScoutById(id: number): Promise<ApiResult<Scout>> {
    try {
      const scout = await this.expressClient.getScoutById(id);
      return {
        success: true,
        data: {
          id: scout.id,
          name: scout.name,
          nameAr: scout.name_ar,
          sport: scout.sport,
          region: scout.region,
          rating: scout.rating,
          academyName: scout.academy_name,
          createdAt: scout.created_at,
        },
        error: null,
      };
    } catch (error) {
      return { success: false, data: null, error: { message: `Scout with id ${id} not found`, code: ErrorCodes.SCOUT_NOT_FOUND } };
    }
  }
}
