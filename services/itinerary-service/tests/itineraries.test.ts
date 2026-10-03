import request from 'supertest';

jest.mock('../src/clients/attractionsClient', () => ({
  attractionsClient: {
    attractionExists: jest.fn().mockResolvedValue(true),
  },
}));

import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { tokenFor } from './helpers';

const app = createApp();
const attractionId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

describe('Itineraries', () => {
  const userId = 'itin-user-1';
  const token = tokenFor(userId);
  let itineraryId: string;

  afterAll(async () => {
    await prisma.itinerary.deleteMany({ where: { userId } });
    await prisma.$disconnect();
  });

  it('rejects listing itineraries without auth', async () => {
    const res = await request(app).get('/api/v1/itineraries');
    expect(res.status).toBe(401);
  });

  it('creates an itinerary', async () => {
    const res = await request(app)
      .post('/api/v1/itineraries')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Weekend in Yaounde', startDate: '2026-09-01', endDate: '2026-09-03' });

    expect(res.status).toBe(201);
    itineraryId = res.body.itinerary.id;
  });

  it('adds an item to the itinerary', async () => {
    const res = await request(app)
      .post(`/api/v1/itineraries/${itineraryId}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({ attractionId, dayNumber: 1, order: 0 });

    expect(res.status).toBe(201);
  });

  it('prevents adding the same attraction twice', async () => {
    const res = await request(app)
      .post(`/api/v1/itineraries/${itineraryId}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({ attractionId, dayNumber: 1, order: 1 });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('already in your itinerary');
  });

  it('fetches the itinerary with its items', async () => {
    const res = await request(app).get(`/api/v1/itineraries/${itineraryId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.itinerary.items).toHaveLength(1);
  });

  it('deletes the itinerary', async () => {
    const res = await request(app)
      .delete(`/api/v1/itineraries/${itineraryId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
});
