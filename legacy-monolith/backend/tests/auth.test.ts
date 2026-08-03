import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { cleanupTestUser, uniqueEmail } from './helpers';

const app = createApp();

describe('Auth', () => {
  const email = uniqueEmail('user');
  const password = 'StrongPass123!';

  afterAll(async () => {
    await cleanupTestUser(email);
    await prisma.$disconnect();
  });

  it('registers a new user and returns an access token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ fullName: 'Test User', email, password });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.role).toBe('USER');
  });

  it('rejects duplicate registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ fullName: 'Test User', email, password });

    expect(res.status).toBe(409);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email, password: 'wrong' });

    expect(res.status).toBe(401);
  });

  it('returns the current user for /auth/me with a valid token', async () => {
    const login = await request(app).post('/api/v1/auth/login').send({ email, password });
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
  });

  it('rejects /auth/me without a token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('updates the display name via PATCH /auth/me', async () => {
    const login = await request(app).post('/api/v1/auth/login').send({ email, password });
    const res = await request(app)
      .patch('/api/v1/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send({ fullName: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.user.fullName).toBe('Updated Name');
  });
});
