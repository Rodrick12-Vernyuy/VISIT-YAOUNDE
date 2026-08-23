import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info(`Attractions service listening on port ${env.port} (${env.nodeEnv})`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${env.port} is already in use`);
  } else {
    logger.error(err.message, { stack: err.stack });
  }
  process.exit(1);
});
