import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Render (and other hosts) give every service the same connection string to
// a single shared Postgres instance, with no schema selected. Each service
// owns one fixed schema, so we append it here rather than requiring every
// deployment target to know how to compose per-service connection strings.
function withSchema(url: string, schema: string): string {
  if (/[?&]schema=/.test(url)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}schema=${schema}`;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4001', 10),
  gatewayUrl: process.env.GATEWAY_URL ?? 'http://localhost:4000',
  databaseUrl: withSchema(
    required('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5433/visit_yaounde?schema=auth'),
    'auth'
  ),
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'dev-access-secret-change-me'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me'),
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshTtlDays: parseInt(process.env.JWT_REFRESH_TTL_DAYS ?? '30', 10),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '300', 10),
  },
  internalServiceToken: process.env.INTERNAL_SERVICE_TOKEN ?? 'dev-internal-token-change-me',
  notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL ?? 'http://localhost:4004',
};
