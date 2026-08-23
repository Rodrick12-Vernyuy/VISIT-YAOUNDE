import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { tokenFor } from './helpers';

const app = createApp();
const internalToken = process.env.INTERNAL_SERVICE_TOKEN!;

describe('Notifications', () => {
  const userId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const token = tokenFor(userId);

  afterAll(async () => {
    await prisma.notification.deleteMany({ where: { userId } });
    await prisma.$disconnect();
  });

  it('rejects listing notifications without auth', async () => {
    const res = await request(app).get('/api/v1/notifications');
    expect(res.status).toBe(401);
  });

  it('rejects internal create without the internal token', async () => {
    const res = await request(app)
      .post('/internal/notifications')
      .send({ userId, type: 'WELCOME', title: 'Welcome', message: 'Hi there' });
    expect(res.status).toBe(401);
  });

  it('creates a notification via the internal endpoint', async () => {
    const res = await request(app)
      .post('/internal/notifications')
      .set('x-internal-token', internalToken)
      .send({ userId, type: 'WELCOME', title: 'Welcome', message: 'Hi there' });

    expect(res.status).toBe(201);
    expect(res.body.notification.read).toBe(false);
  });

  it('lists the user notification', async () => {
    const res = await request(app).get('/api/v1/notifications').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
  });

  it('marks a notification as read', async () => {
    const list = await request(app).get('/api/v1/notifications').set('Authorization', `Bearer ${token}`);
    const id = list.body.items[0].id;

    const res = await request(app).patch(`/api/v1/notifications/${id}/read`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.notification.read).toBe(true);
  });
});
