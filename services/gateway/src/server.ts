import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const app = createApp();

app.listen(env.port, () => {
  logger.info(`Gateway listening on port ${env.port} (${env.nodeEnv})`);
  logger.info(`Routing to auth=${env.services.auth} attractions=${env.services.attractions} engagement=${env.services.engagement}`);
});
