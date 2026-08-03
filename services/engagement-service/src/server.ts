import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const app = createApp();

app.listen(env.port, () => {
  logger.info(`Engagement service listening on port ${env.port} (${env.nodeEnv})`);
});
