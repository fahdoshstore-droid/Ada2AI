import Fastify from 'fastify';
import cors from '@fastify/cors';
import { playersRoutes } from './routes/players.routes.js';
import { matchesRoutes } from './routes/matches.routes.js';
import { analysisRoutes } from './routes/analysis.routes.js';
import { scoutsRoutes } from './routes/scouts.routes.js';

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: true });

  app.register(playersRoutes, { prefix: '/api/players' });
  app.register(matchesRoutes, { prefix: '/api/matches' });
  app.register(analysisRoutes, { prefix: '/api/analysis' });
  app.register(scoutsRoutes, { prefix: '/api/scouts' });

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}
