import path from 'path';
import compression from 'compression';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { logger } from './config/logger';
import { apiRouter } from './routes';
import { internalRouter } from './routes/internal.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';

export function createApp(): Express {
  const app = express();

  // No CORS middleware here deliberately: this service is only ever called
  // by the gateway (server-to-server) or other internal services — CORS is a
  // browser-enforced concept, and the only thing a browser ever talks to
  // directly is the gateway. A cors() header set here would otherwise leak
  // through the proxy and fight with the gateway's own CORS response.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    morgan('combined', {
      stream: { write: (message: string) => logger.info(message.trim()) },
    })
  );
  app.use('/uploads', express.static(path.join(process.cwd(), env.uploadDir)));

  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'attractions-service' }));

  app.use('/internal', internalRouter);
  app.use('/api/v1', apiRateLimiter, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
