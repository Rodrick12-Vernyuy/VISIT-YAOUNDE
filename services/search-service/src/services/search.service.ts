import { attractionsClient, SearchQuery } from '../clients/attractionsClient';
import { redis } from '../config/redis';
import { env } from '../config/env';
import { logger } from '../config/logger';

function cacheKey(query: SearchQuery): string {
  const normalized = Object.keys(query)
    .sort()
    .filter((key) => query[key as keyof SearchQuery] !== undefined)
    .map((key) => `${key}=${query[key as keyof SearchQuery]}`)
    .join('&');
  return `search:attractions:${normalized}`;
}

export const searchService = {
  async search(query: SearchQuery) {
    const key = cacheKey(query);

    try {
      const cached = await redis.get(key);
      if (cached) return { ...JSON.parse(cached), cached: true };
    } catch (err) {
      logger.warn(`Redis unavailable, bypassing cache: ${(err as Error).message}`);
    }

    const result = await attractionsClient.search(query);

    try {
      await redis.set(key, JSON.stringify(result), 'EX', env.cacheTtlSeconds);
    } catch (err) {
      logger.warn(`Redis unavailable, skipping cache write: ${(err as Error).message}`);
    }

    return { ...result, cached: false };
  },
};
