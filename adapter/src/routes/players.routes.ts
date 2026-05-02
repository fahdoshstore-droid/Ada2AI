import { FastifyInstance } from 'fastify';
import { PlayersService } from '../services/players.service.js';
import { ok, fail } from '../utils/response.js';
import { ErrorCodes } from '../utils/errors.js';

const playersService = new PlayersService();

export async function playersRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const { team, position } = request.query as { team?: string; position?: string };
    try {
      const result = await playersService.getPlayers({ team, position });
      return ok(result);
    } catch (error: any) {
      const code = error.code || ErrorCodes.BACKEND_ERROR;
      const message = error.message || 'Failed to fetch players';
      return fail(message, code);
    }
  });

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return fail('Invalid player id', ErrorCodes.VALIDATION_ERROR);
    }
    try {
      const player = await playersService.getPlayerById(parsedId);
      return ok({ player });
    } catch (error: any) {
      const code = error.code || ErrorCodes.BACKEND_ERROR;
      const message = error.message || 'Failed to fetch player';
      const status = error.status || 500;
      reply.status(status);
      return fail(message, code);
    }
  });
}