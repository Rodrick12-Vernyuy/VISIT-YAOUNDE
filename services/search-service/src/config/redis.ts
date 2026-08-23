import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

export const redis = new Redis(env.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });

redis.on('error', (err) => logger.error(`Redis error: ${err.message}`));
