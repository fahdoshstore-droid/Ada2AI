import { FastifyInstance } from 'fastify';
import { ScoutService } from '../services/scouts.service.js';
import { ok, fail } from '../utils/response.js';
import { ErrorCodes } from '../utils/errors.js';

const scoutService = new ScoutService();

export async function scoutsRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const result = await scoutService.getAllScouts();
    if (result.success) {
      return ok(result.data);
    }
    return fail(result.error.message, result.error.code);
  });

  app.get('/:id', async (request, reply) => {
    const id = Number((request.params as { id?: string }).id);
    if (isNaN(id)) {
      return fail('Invalid scout id', ErrorCodes.VALIDATION_ERROR);
    }
    const result = await scoutService.getScoutById(id);
    if (result.success) {
      return ok(result.data);
    }
    return fail(result.error.message, result.error.code);
  });
}
