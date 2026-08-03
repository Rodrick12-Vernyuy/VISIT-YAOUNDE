import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { signAccessToken } from '../src/utils/jwt';
import { cleanupTestUser, createAdmin, ensureCategory, uniqueEmail } from './helpers';

const app = createApp();

describe('Attractions', () => {
  let adminToken: string;
  let adminEmail: string;
  let categoryId: string;
  let createdAttractionId: string;
  const attractionName = `Test Attraction ${Date.now()}`;

  beforeAll(async () => {
    const admin = await createAdmin();
    adminEmail = admin.email;
    adminToken = signAccessToken({ sub: admin.user.id, email: admin.email, role: 'ADMIN' });
    const category = await ensureCategory();
    categoryId = category.id;
  });

  afterAll(async () => {
    if (createdAttractionId) {
      await prisma.attraction.deleteMany({ where: { id: createdAttractionId } });
    }
    await cleanupTestUser(adminEmail);
    await prisma.$disconnect();
  });

  it('rejects creating an attraction without auth', async () => {
    const res = await request(app).post('/api/v1/attractions').send({});
    expect(res.status).toBe(401);
  });

  it('rejects creating an attraction as a non-admin user', async () => {
    const userEmail = uniqueEmail('regular');
    const userToken = signAccessToken({ sub: 'fake-user-id', email: userEmail, role: 'USER' });

    const res = await request(app)
      .post('/api/v1/attractions')
      .set('Authorization', `Bearer ${userToken}`)
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
      .set('Authorization', `Bearer ${adminToken}`)
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
    expect(res.body.attraction.slug).toContain('test-attraction');
    createdAttractionId = res.body.attraction.id;
  });

  it('lists published attractions including the new one', async () => {
    const res = await request(app).get('/api/v1/attractions').query({ q: attractionName });
    expect(res.status).toBe(200);
    expect(res.body.items.some((item: { id: string }) => item.id === createdAttractionId)).toBe(true);
  });

  it('gets the attraction by slug', async () => {
    const list = await request(app).get('/api/v1/attractions').query({ q: attractionName });
    const slug = list.body.items[0].slug;

    const res = await request(app).get(`/api/v1/attractions/${slug}`);
    expect(res.status).toBe(200);
    expect(res.body.attraction.name).toBe(attractionName);
  });

  it('updates the attraction as admin', async () => {
    const res = await request(app)
      .patch(`/api/v1/attractions/${createdAttractionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ shortDescription: 'An updated short description for testing.' });

    expect(res.status).toBe(200);
    expect(res.body.attraction.shortDescription).toBe('An updated short description for testing.');
  });

  it('deletes the attraction as admin', async () => {
    const res = await request(app)
      .delete(`/api/v1/attractions/${createdAttractionId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
    createdAttractionId = '';
  });
});
