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
});
