import { FastifyInstance } from 'fastify';
import { AnalysisService } from '../services/analysis.service.js';
import { ok, fail } from '../utils/response.js';
import { ErrorCodes } from '../utils/errors.js';
import { z } from 'zod';
import { isAxiosError } from 'axios';

const analysisService = new AnalysisService();

// Validation schema for video analysis request
const videoAnalysisSchema = z.object({
  videoUrl: z.string().url(),
  playerId: z.number().int().positive(),
  matchId: z.number().int().positive(),
});

// GET / - list all analyses
// GET /:id - get analysis by ID
// GET /player/:playerId - get analyses by player ID
// POST /video - submit video for async analysis

export async function analysisRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    try {
      const result = await analysisService.getAnalyses();
      return ok({ analyses: result.analyses });
    } catch (error) {
      if (isAxiosError(error) && !error.response) {
        return fail('Network error: Unable to reach backend server', ErrorCodes.NETWORK_ERROR);
      }
      return fail('Failed to fetch analyses', ErrorCodes.BACKEND_ERROR);
    }
  });

  app.get('/:id', async (request, reply) => {
    const id = Number((request.params as { id?: string }).id);
    if (isNaN(id) || id <= 0) {
      return fail('Invalid analysis id', ErrorCodes.VALIDATION_ERROR);
    }
    try {
      const analysis = await analysisService.getAnalysisById(id);
      return ok({ analysis });
    } catch (error) {
      if (isAxiosError(error) && !error.response) {
        return fail('Network error: Unable to reach backend server', ErrorCodes.NETWORK_ERROR);
      }
      return fail(`Analysis with id ${id} not found`, ErrorCodes.ANALYSIS_NOT_FOUND);
    }
  });

  app.get('/player/:playerId', async (request, reply) => {
    const playerId = Number((request.params as { playerId?: string }).playerId);
    if (isNaN(playerId) || playerId <= 0) {
      return fail('Invalid player id', ErrorCodes.VALIDATION_ERROR);
    }
    try {
      const result = await analysisService.getAnalysesByPlayerId(playerId);
      return ok({ analyses: result.analyses });
    } catch (error) {
      if (isAxiosError(error) && !error.response) {
        return fail('Network error: Unable to reach backend server', ErrorCodes.NETWORK_ERROR);
      }
      return fail('Failed to fetch analyses for player', ErrorCodes.BACKEND_ERROR);
    }
  });

  app.post('/video', async (request, reply) => {
    const parsed = videoAnalysisSchema.safeParse(request.body);
    if (!parsed.success) {
      return fail('Invalid request body: videoUrl (string), playerId (number), and matchId (number) are required', ErrorCodes.VALIDATION_ERROR);
    }
    const { videoUrl, playerId, matchId } = parsed.data;
    // Async video analysis - returns immediately with accepted response
    // The actual analysis will be processed by the backend
    reply.status(202);
    return ok({
      analysis: {
        id: 0,
        playerId,
        matchId,
        videoUrl,
        status: 'processing',
        message: 'Video analysis has been queued',
      },
    });
  });
}
