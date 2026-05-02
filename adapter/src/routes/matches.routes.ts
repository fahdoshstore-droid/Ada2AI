import { FastifyInstance } from 'fastify';
import { MatchesService } from '../services/matches.service.js';
import { ok, fail } from '../utils/response.js';
import { ErrorCodes } from '../utils/errors.js';
import { isAxiosError } from 'axios';

const matchesService = new MatchesService();

export async function matchesRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const { team, status, limit } = request.query as { team?: string; status?: string; limit?: number };
    try {
      const result = await matchesService.getMatches({ team, status, limit });
      return ok({ matches: result.matches });
    } catch (error) {
      if (isAxiosError(error) && !error.response) {
        return fail('Network error: unable to reach backend', ErrorCodes.NETWORK_ERROR);
      }
      return fail('Failed to fetch matches', ErrorCodes.BACKEND_ERROR);
    }
  });

  app.get('/:id', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    if (isNaN(id)) {
      return fail('Invalid match id', ErrorCodes.VALIDATION_ERROR);
    }
    try {
      const match = await matchesService.getMatchById(id);
      return ok({ match });
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          return fail(`Match with id ${id} not found`, ErrorCodes.MATCH_NOT_FOUND);
        }
        return fail('Failed to fetch match', ErrorCodes.BACKEND_ERROR);
      }
      return fail('Failed to fetch match', ErrorCodes.BACKEND_ERROR);
    }
  });
}