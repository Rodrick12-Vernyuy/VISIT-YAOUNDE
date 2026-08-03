import axios from 'axios';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

const client = axios.create({
  baseURL: env.attractionsServiceUrl,
  headers: { 'x-internal-token': env.internalServiceToken },
  timeout: 5000,
});

/**
 * Cross-service calls to attractions-service. This is the concrete
 * "inter-service communication" for the engagement/attractions split:
 * engagement-service verifies an attraction exists before letting a user
 * review/favorite it, and pushes rating aggregates back after review changes.
 */
export const attractionsClient = {
  async attractionExists(attractionId: string): Promise<boolean> {
    try {
      const res = await client.get<{ exists: boolean }>(`/internal/attractions/${attractionId}/exists`);
      return res.data.exists;
    } catch {
      throw ApiError.badRequest('Could not verify attraction — attractions-service unavailable');
    }
  },

  async syncRating(attractionId: string, averageRating: number, reviewCount: number): Promise<void> {
    try {
      await client.patch(`/internal/attractions/${attractionId}/rating`, { averageRating, reviewCount });
    } catch {
      throw ApiError.badRequest('Could not sync rating — attractions-service unavailable');
    }
  },
};
