import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4003', 10),
  gatewayUrl: process.env.GATEWAY_URL ?? 'http://localhost:4000',
  databaseUrl: required(
    'DATABASE_URL',
    'postgresql://postgres:postgres@localhost:5433/visit_yaounde?schema=engagement'
  ),
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'dev-access-secret-change-me'),
  },
  attractionsServiceUrl: process.env.ATTRACTIONS_SERVICE_URL ?? 'http://localhost:4002',
  authServiceUrl: process.env.AUTH_SERVICE_URL ?? 'http://localhost:4001',
  internalServiceToken: process.env.INTERNAL_SERVICE_TOKEN ?? 'dev-internal-token-change-me',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '300', 10),
  },
};
