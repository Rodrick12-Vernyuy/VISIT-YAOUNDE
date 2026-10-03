import compression from 'compression';
import cors from 'cors';
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { logger } from './config/logger';
import { proxyRouter } from './routes/proxy';

export function createApp(): Express {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(compression());
  app.use(
    morgan('combined', {
      stream: { write: (message: string) => logger.info(message.trim()) },
    })
  );

  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'gateway' }));

  const apiRateLimiter = rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
  });
  if (env.nodeEnv !== 'development') {
    app.use('/api/v1', apiRateLimiter);
  }

  // Proxy routes must come before any body-parsing middleware — the proxy
  // needs to stream the raw request body (including multipart file uploads)
  // to the downstream service untouched.
  app.use(proxyRouter);

  app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

  return app;
}
