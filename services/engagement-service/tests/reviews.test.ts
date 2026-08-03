import request from 'supertest';

jest.mock('../src/clients/attractionsClient', () => ({
  attractionsClient: {
    attractionExists: jest.fn().mockResolvedValue(true),
    syncRating: jest.fn().mockResolvedValue(undefined),
  },
}));

import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { attractionsClient } from '../src/clients/attractionsClient';
import { tokenFor } from './helpers';

const app = createApp();
const attractionId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

describe('Reviews', () => {
  const userId = 'user-1';
  const otherUserId = 'user-2';
  let reviewId: string;

  afterAll(async () => {
    await prisma.review.deleteMany({ where: { attractionId } });
    await prisma.$disconnect();
  });

  it('rejects creating a review without auth', async () => {
    const res = await request(app).post(`/api/v1/attractions/${attractionId}/reviews`).send({});
    expect(res.status).toBe(401);
  });

  it('creates a review and syncs the rating with attractions-service', async () => {
    const res = await request(app)
      .post(`/api/v1/attractions/${attractionId}/reviews`)
      .set('Authorization', `Bearer ${tokenFor(userId)}`)
      .send({ rating: 4, comment: 'Really enjoyed this attraction, would visit again.' });

    expect(res.status).toBe(201);
    expect(attractionsClient.attractionExists).toHaveBeenCalledWith(attractionId);
    expect(attractionsClient.syncRating).toHaveBeenCalledWith(attractionId, 4, 1);
    reviewId = res.body.review.id;
  });

  it('rejects a duplicate review from the same user', async () => {
    const res = await request(app)
      .post(`/api/v1/attractions/${attractionId}/reviews`)
      .set('Authorization', `Bearer ${tokenFor(userId)}`)
      .send({ rating: 5, comment: 'Trying to review again, should be rejected.' });

    expect(res.status).toBe(409);
  });

  it('returns 404 when the attraction does not exist', async () => {
    (attractionsClient.attractionExists as jest.Mock).mockResolvedValueOnce(false);
    const res = await request(app)
      .post('/api/v1/attractions/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/reviews')
      .set('Authorization', `Bearer ${tokenFor(userId)}`)
      .send({ rating: 3, comment: 'Should fail because attraction is missing.' });

    expect(res.status).toBe(404);
  });

  it('lists reviews for an attraction', async () => {
    const res = await request(app).get(`/api/v1/attractions/${attractionId}/reviews`);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
  });

  it('rejects another user editing someone else’s review', async () => {
    const res = await request(app)
      .patch(`/api/v1/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${tokenFor(otherUserId)}`)
      .send({ rating: 1 });

    expect(res.status).toBe(403);
  });

  it('rejects the author marking their own review as helpful', async () => {
    const res = await request(app)
      .post(`/api/v1/reviews/${reviewId}/helpful`)
      .set('Authorization', `Bearer ${tokenFor(userId)}`);

    expect(res.status).toBe(400);
  });

  it('lets another user toggle a review as helpful', async () => {
    const res = await request(app)
      .post(`/api/v1/reviews/${reviewId}/helpful`)
      .set('Authorization', `Bearer ${tokenFor(otherUserId)}`);

    expect(res.status).toBe(200);
    expect(res.body.helpful).toBe(true);
  });

  it('lets the author delete their review', async () => {
    const res = await request(app)
      .delete(`/api/v1/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${tokenFor(userId)}`);

    expect(res.status).toBe(204);
  });
});
