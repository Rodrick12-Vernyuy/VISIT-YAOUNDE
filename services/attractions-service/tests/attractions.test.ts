import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { adminToken, ensureCategory, userToken } from './helpers';

const app = createApp();

describe('Attractions', () => {
  let categoryId: string;
  let createdAttractionId: string;
  const attractionName = `Test Attraction ${Date.now()}`;

  beforeAll(async () => {
    const category = await ensureCategory();
    categoryId = category.id;
  });

  afterAll(async () => {
    if (createdAttractionId) {
      await prisma.attraction.deleteMany({ where: { id: createdAttractionId } });
    }
    await prisma.$disconnect();
  });

  it('rejects creating an attraction without auth', async () => {
    const res = await request(app).post('/api/v1/attractions').send({});
    expect(res.status).toBe(401);
  });

  it('rejects creating an attraction as a non-admin user', async () => {
    const res = await request(app)
      .post('/api/v1/attractions')
      .set('Authorization', `Bearer ${userToken()}`)
      .send({
        name: attractionName,
        shortDescription: 'A short description for testing purposes.',
        description: 'A longer description used for automated testing of attraction creation.',
        district: 'Centre-ville',
        address: '123 Test Street',
        latitude: 3.86,
        longitude: 11.52,
        openingHours: '9am - 5pm',
        entryFee: 'Free',
        categoryId,
      });

    expect(res.status).toBe(403);
  });

  it('creates an attraction as an admin', async () => {
    const res = await request(app)
      .post('/api/v1/attractions')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({
        name: attractionName,
        shortDescription: 'A short description for testing purposes.',
        description: 'A longer description used for automated testing of attraction creation.',
        district: 'Centre-ville',
        address: '123 Test Street',
        latitude: 3.86,
        longitude: 11.52,
        openingHours: '9am - 5pm',
        entryFee: 'Free',
        categoryId,
      });

    expect(res.status).toBe(201);
    createdAttractionId = res.body.attraction.id;
  });

  it('lists published attractions including the new one', async () => {
    const res = await request(app).get('/api/v1/attractions').query({ q: attractionName });
    expect(res.status).toBe(200);
    expect(res.body.items.some((item: { id: string }) => item.id === createdAttractionId)).toBe(true);
  });

  it('checks existence via the internal endpoint with a valid token', async () => {
    const res = await request(app)
      .get(`/internal/attractions/${createdAttractionId}/exists`)
      .set('x-internal-token', process.env.INTERNAL_SERVICE_TOKEN!);

    expect(res.status).toBe(200);
    expect(res.body.exists).toBe(true);
  });

  it('rejects the internal endpoint without the shared token', async () => {
    const res = await request(app).get(`/internal/attractions/${createdAttractionId}/exists`);
    expect(res.status).toBe(401);
  });

  it('syncs rating via the internal endpoint', async () => {
    const res = await request(app)
      .patch(`/internal/attractions/${createdAttractionId}/rating`)
      .set('x-internal-token', process.env.INTERNAL_SERVICE_TOKEN!)
      .send({ averageRating: 4.5, reviewCount: 2 });

    expect(res.status).toBe(200);

    const check = await request(app).get('/api/v1/attractions').query({ q: attractionName });
    const updated = check.body.items.find((item: { id: string }) => item.id === createdAttractionId);
    expect(updated.averageRating).toBe(4.5);
    expect(updated.reviewCount).toBe(2);
  });

  it('deletes the attraction as admin', async () => {
    const res = await request(app)
      .delete(`/api/v1/attractions/${createdAttractionId}`)
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(204);
    createdAttractionId = '';
  });
});
