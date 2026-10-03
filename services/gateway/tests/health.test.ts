import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Gateway', () => {
  it('responds healthy on /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/not-a-real-route');
    expect(res.status).toBe(404);
  });

  it('does not rate limit API requests in development', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalRateLimitMax = process.env.RATE_LIMIT_MAX;
    process.env.NODE_ENV = 'development';
    process.env.RATE_LIMIT_MAX = '1';
    jest.resetModules();

    try {
      const { createApp: createDevelopmentApp } = require('../src/app') as { createApp: typeof createApp };
      const developmentApp = createDevelopmentApp();
      const first = await request(developmentApp).get('/api/v1/not-a-real-route');
      const second = await request(developmentApp).get('/api/v1/not-a-real-route');

      expect(first.status).toBe(404);
      expect(second.status).toBe(404);
    } finally {
      if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = originalNodeEnv;
      if (originalRateLimitMax === undefined) delete process.env.RATE_LIMIT_MAX;
      else process.env.RATE_LIMIT_MAX = originalRateLimitMax;
      jest.resetModules();
    }
  });

  it('keeps API rate limiting enabled in production', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalRateLimitMax = process.env.RATE_LIMIT_MAX;
    process.env.NODE_ENV = 'production';
    process.env.RATE_LIMIT_MAX = '1';
    jest.resetModules();

    try {
      const { createApp: createProductionApp } = require('../src/app') as { createApp: typeof createApp };
      const productionApp = createProductionApp();
      const first = await request(productionApp).get('/api/v1/not-a-real-route');
      const second = await request(productionApp).get('/api/v1/not-a-real-route');

      expect(first.status).toBe(404);
      expect(second.status).toBe(429);
    } finally {
      if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = originalNodeEnv;
      if (originalRateLimitMax === undefined) delete process.env.RATE_LIMIT_MAX;
      else process.env.RATE_LIMIT_MAX = originalRateLimitMax;
      jest.resetModules();
    }
  });
});
