import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { signAccessToken } from '../src/utils/jwt';
import { cleanupTestUser, createTestAttraction, createUser, ensureCategory } from './helpers';

const app = createApp();

describe('Reviews', () => {
  let userToken: string;
  let userEmail: string;
  let otherToken: string;
  let otherEmail: string;
  let attractionId: string;
  let attractionSlug: string;
  let reviewId: string;

  beforeAll(async () => {
    const category = await ensureCategory();
    const owner = await createUser();
    const attraction = await createTestAttraction(category.id, owner.user.id);
    attractionId = attraction.id;
    attractionSlug = attraction.slug;

    const user = await createUser();
    userEmail = user.email;
    userToken = signAccessToken({ sub: user.user.id, email: user.email, role: 'USER' });

    const other = await createUser();
    otherEmail = other.email;
    otherToken = signAccessToken({ sub: other.user.id, email: other.email, role: 'USER' });

    await cleanupTestUser(owner.email);
  });

  afterAll(async () => {
    await prisma.attraction.deleteMany({ where: { id: attractionId } });
    await cleanupTestUser(userEmail);
    await cleanupTestUser(otherEmail);
    await prisma.$disconnect();
  });

  it('rejects creating a review without auth', async () => {
    const res = await request(app).post(`/api/v1/attractions/${attractionId}/reviews`).send({});
    expect(res.status).toBe(401);
  });

  it('creates a review', async () => {
    const res = await request(app)
      .post(`/api/v1/attractions/${attractionId}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 4, comment: 'Really enjoyed this attraction, would visit again.' });

    expect(res.status).toBe(201);
    expect(res.body.review.rating).toBe(4);
    reviewId = res.body.review.id;
  });

  it('updates the attraction average rating and review count', async () => {
    const res = await request(app).get(`/api/v1/attractions/${attractionSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.attraction.reviewCount).toBe(1);
    expect(res.body.attraction.averageRating).toBe(4);
  });

  it('rejects a second review from the same user for the same attraction', async () => {
    const res = await request(app)
      .post(`/api/v1/attractions/${attractionId}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 5, comment: 'Trying to review again, should be rejected.' });

    expect(res.status).toBe(409);
  });

  it('lists reviews for an attraction', async () => {
    const res = await request(app).get(`/api/v1/attractions/${attractionId}/reviews`);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
  });

  it('rejects another user editing someone else’s review', async () => {
    const res = await request(app)
      .patch(`/api/v1/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ rating: 1 });

    expect(res.status).toBe(403);
  });

  it('lets the author edit their review', async () => {
    const res = await request(app)
      .patch(`/api/v1/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 2, comment: 'Updating my opinion after a second visit.' });

    expect(res.status).toBe(200);
    expect(res.body.review.rating).toBe(2);
  });

  it('rejects the author marking their own review as helpful', async () => {
    const res = await request(app)
      .post(`/api/v1/reviews/${reviewId}/helpful`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(400);
  });

  it('lets another user toggle a review as helpful', async () => {
    const res = await request(app)
      .post(`/api/v1/reviews/${reviewId}/helpful`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.helpful).toBe(true);

    const toggledOff = await request(app)
      .post(`/api/v1/reviews/${reviewId}/helpful`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(toggledOff.body.helpful).toBe(false);
  });

  it('lets the author delete their review', async () => {
    const res = await request(app)
      .delete(`/api/v1/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(204);

    const attraction = await request(app).get(`/api/v1/attractions/${attractionSlug}`);
    expect(attraction.body.attraction.reviewCount).toBe(0);
  });
});
