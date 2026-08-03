import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { configurePassport } from './config/passport';

configurePassport();

const app = createApp();

app.listen(env.port, () => {
  logger.info(`Visit Yaoundé API listening on port ${env.port} (${env.nodeEnv})`);
  logger.info(`Swagger docs: http://localhost:${env.port}/api/docs`);
});
