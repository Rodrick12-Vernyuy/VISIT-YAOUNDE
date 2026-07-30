import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { signAccessToken } from '../src/utils/jwt';
import { cleanupTestUser, createTestAttraction, createUser, ensureCategory } from './helpers';

const app = createApp();

describe('Favorites', () => {
  let userToken: string;
  let userEmail: string;
  let attractionId: string;

  beforeAll(async () => {
    const category = await ensureCategory();
    const owner = await createUser();
    attractionId = (await createTestAttraction(category.id, owner.user.id)).id;

    const user = await createUser();
    userEmail = user.email;
    userToken = signAccessToken({ sub: user.user.id, email: user.email, role: 'USER' });

    await cleanupTestUser(owner.email);
  });

  afterAll(async () => {
    await prisma.attraction.deleteMany({ where: { id: attractionId } });
    await cleanupTestUser(userEmail);
    await prisma.$disconnect();
  });

  it('rejects listing favorites without auth', async () => {
    const res = await request(app).get('/api/v1/favorites');
    expect(res.status).toBe(401);
  });

  it('starts with an empty favorites list', async () => {
    const res = await request(app).get('/api/v1/favorites').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.favorites).toHaveLength(0);
  });

  it('adds an attraction to favorites', async () => {
    const res = await request(app)
      .post(`/api/v1/favorites/${attractionId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(201);
  });

  it('is idempotent when favoriting the same attraction twice', async () => {
    const res = await request(app)
      .post(`/api/v1/favorites/${attractionId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(201);

    const list = await request(app).get('/api/v1/favorites').set('Authorization', `Bearer ${userToken}`);
    expect(list.body.favorites).toHaveLength(1);
  });

  it('lists the favorited attraction', async () => {
    const res = await request(app).get('/api/v1/favorites').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.favorites[0].attraction.id).toBe(attractionId);
  });

  it('removes an attraction from favorites', async () => {
    const res = await request(app)
      .delete(`/api/v1/favorites/${attractionId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(204);

    const list = await request(app).get('/api/v1/favorites').set('Authorization', `Bearer ${userToken}`);
    expect(list.body.favorites).toHaveLength(0);
  });
});
