import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../config/logger';

const client = axios.create({
  baseURL: env.notificationServiceUrl,
  headers: { 'x-internal-token': env.internalServiceToken },
  timeout: 5000,
});

/**
 * Best-effort cross-service call: a failed or unavailable notification-service
 * must never block registration, so errors are logged and swallowed here.
 */
export const notificationClient = {
  async sendWelcome(userId: string): Promise<void> {
    try {
      await client.post('/internal/notifications', {
        userId,
        type: 'WELCOME',
        title: 'Welcome to Visit Yaoundé',
        message: 'Thanks for joining — start exploring attractions and build your first itinerary.',
      });
    } catch (err) {
      logger.warn(`Could not send welcome notification: ${(err as Error).message}`);
    }
  },
};
