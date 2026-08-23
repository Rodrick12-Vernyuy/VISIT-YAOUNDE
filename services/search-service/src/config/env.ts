import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4006', 10),
  gatewayUrl: process.env.GATEWAY_URL ?? 'http://localhost:4000',
  attractionsServiceUrl: process.env.ATTRACTIONS_SERVICE_URL ?? 'http://localhost:4002',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  cacheTtlSeconds: parseInt(process.env.SEARCH_CACHE_TTL_SECONDS ?? '60', 10),
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '300', 10),
  },
};
