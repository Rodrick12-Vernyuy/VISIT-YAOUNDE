import axios from 'axios';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

const client = axios.create({
  baseURL: env.attractionsServiceUrl,
  timeout: 5000,
});

export interface SearchQuery {
  q?: string;
  category?: string;
  district?: string;
  featured?: string;
  sort?: string;
  page?: string;
  pageSize?: string;
}

/**
 * search-service holds no data of its own — it fronts attractions-service's
 * public listing endpoint with a Redis cache, which is the entire point of
 * splitting search out as its own service.
 */
export const attractionsClient = {
  async search(query: SearchQuery) {
    try {
      const res = await client.get('/api/v1/attractions', { params: query });
      return res.data;
    } catch {
      throw ApiError.badGateway('Could not reach attractions-service');
    }
  },
};
