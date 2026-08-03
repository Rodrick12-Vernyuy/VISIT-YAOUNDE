import request from 'supertest';

jest.mock('../src/clients/attractionsClient', () => ({
  attractionsClient: {
    attractionExists: jest.fn().mockResolvedValue(true),
    syncRating: jest.fn().mockResolvedValue(undefined),
  },
}));

import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { tokenFor } from './helpers';

const app = createApp();
const attractionId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

describe('Favorites', () => {
  const userId = 'fav-user-1';
  const token = tokenFor(userId);

  afterAll(async () => {
    await prisma.favorite.deleteMany({ where: { userId } });
    await prisma.$disconnect();
  });

  it('rejects listing favorites without auth', async () => {
    const res = await request(app).get('/api/v1/favorites');
    expect(res.status).toBe(401);
  });

  it('starts with an empty favorites list', async () => {
    const res = await request(app).get('/api/v1/favorites').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.favorites).toHaveLength(0);
  });

  it('adds an attraction to favorites', async () => {
    const res = await request(app)
      .post(`/api/v1/favorites/${attractionId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(201);
  });

  it('is idempotent when favoriting the same attraction twice', async () => {
    const res = await request(app)
      .post(`/api/v1/favorites/${attractionId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(201);

    const list = await request(app).get('/api/v1/favorites').set('Authorization', `Bearer ${token}`);
    expect(list.body.favorites).toHaveLength(1);
  });

  it('removes an attraction from favorites', async () => {
    const res = await request(app)
      .delete(`/api/v1/favorites/${attractionId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);

    const list = await request(app).get('/api/v1/favorites').set('Authorization', `Bearer ${token}`);
    expect(list.body.favorites).toHaveLength(0);
  });
});
