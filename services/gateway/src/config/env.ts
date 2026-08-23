import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:3000',
  services: {
    auth: process.env.AUTH_SERVICE_URL ?? 'http://localhost:4001',
    attractions: process.env.ATTRACTIONS_SERVICE_URL ?? 'http://localhost:4002',
    engagement: process.env.ENGAGEMENT_SERVICE_URL ?? 'http://localhost:4003',
    notification: process.env.NOTIFICATION_SERVICE_URL ?? 'http://localhost:4004',
    itinerary: process.env.ITINERARY_SERVICE_URL ?? 'http://localhost:4005',
    search: process.env.SEARCH_SERVICE_URL ?? 'http://localhost:4006',
    booking: process.env.BOOKING_SERVICE_URL ?? 'http://localhost:4007',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '600', 10),
  },
};
