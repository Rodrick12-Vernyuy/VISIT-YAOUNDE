import compression from 'compression';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { logger } from './config/logger';
import { apiRouter } from './routes';
import { internalRouter } from './routes/internal.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';

export function createApp(): Express {
  const app = express();

  // No CORS middleware here deliberately: this service is only ever called
  // by the gateway (server-to-server) or other internal services — CORS is
  // a browser-enforced concept, so it belongs solely at the gateway.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    morgan('combined', {
      stream: { write: (message: string) => logger.info(message.trim()) },
    })
  );

  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'notification-service' }));

  app.use('/internal', internalRouter);
  app.use('/api/v1', apiRateLimiter, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
