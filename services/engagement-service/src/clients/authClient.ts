import axios from 'axios';
import { env } from '../config/env';

const client = axios.create({
  baseURL: env.authServiceUrl,
  headers: { 'x-internal-token': env.internalServiceToken },
  timeout: 5000,
});

export interface UserSummary {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

/**
 * Reviews/favorites only store a userId (no cross-service foreign key), so
 * display data like the reviewer's name has to be composed at read time by
 * calling auth-service — a common microservices pattern (API composition)
 * for data that spans service boundaries.
 */
export const authClient = {
  async getUsersByIds(ids: string[]): Promise<Map<string, UserSummary>> {
    if (!ids.length) return new Map();
    try {
      const res = await client.get<{ users: UserSummary[] }>('/internal/users', {
        params: { ids: ids.join(',') },
      });
      return new Map(res.data.users.map((u) => [u.id, u]));
    } catch {
      return new Map();
    }
  },
};
