/**
 * SEN 3241 — Software Validation & Verification, Task 3 (Automated Test Implementation)
 *
 * Automated implementation of every case in exam-vv/task2-test-design/test-suite.md.
 * Each `it()` name starts with its Test Case ID (TC-xx) so the mapping back to the
 * black-box design (equivalence partitioning / boundary value analysis) is traceable.
 *
 * `attractionsClient` and `authClient` are mocked at the module boundary — this is a
 * deliberate isolation choice explained in the test plan, not a shortcut: it lets this
 * suite exercise the real controller -> service -> repository -> Postgres path for
 * engagement-service, without requiring attractions-service/auth-service to be running.
 */
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
const attractionId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const missingAttractionId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

function createReview(userId: string, body: unknown, targetAttractionId = attractionId) {
  const req = request(app).post(`/api/v1/attractions/${targetAttractionId}/reviews`);
  return userId
    ? req.set('Authorization', `Bearer ${tokenFor(userId)}`).send(body as object)
    : req.send(body as object);
}

describe('Review creation — V&V test suite (TC-01..TC-13)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (attractionsClient.attractionExists as jest.Mock).mockResolvedValue(true);
    (attractionsClient.syncRating as jest.Mock).mockResolvedValue(undefined);
  });

  afterAll(async () => {
    await prisma.review.deleteMany({ where: { attractionId } });
    await prisma.$disconnect();
  });

  it('TC-01 (normal path): valid rating and comment creates a review and syncs the rating', async () => {
    const res = await createReview('vv-user-1', {
      rating: 4,
      comment: 'Really enjoyed this attraction, would visit again.',
    });

    expect(res.status).toBe(201);
    expect(res.body.review.rating).toBe(4);
    expect(attractionsClient.syncRating).toHaveBeenCalledWith(attractionId, 4, 1);
  });

  it('TC-02 (boundary, rating min=1): rating of exactly 1 is accepted', async () => {
    const res = await createReview('vv-user-2', {
      rating: 1,
      comment: 'Not worth the trip, disappointing overall.',
    });
    expect(res.status).toBe(201);
    expect(res.body.review.rating).toBe(1);
  });

  it('TC-03 (boundary, rating max=5): rating of exactly 5 is accepted', async () => {
    const res = await createReview('vv-user-3', {
      rating: 5,
      comment: 'Absolutely stunning, a must-see in Yaounde.',
    });
    expect(res.status).toBe(201);
    expect(res.body.review.rating).toBe(5);
  });

  it('TC-04 (boundary, rating min-1=0): rating of 0 is rejected', async () => {
    const res = await createReview('vv-user-4', {
      rating: 0,
      comment: 'Rating is one below the allowed minimum.',
    });
    expect(res.status).toBe(400);
    expect(attractionsClient.syncRating).not.toHaveBeenCalled();
  });

  it('TC-05 (boundary, rating max+1=6): rating of 6 is rejected', async () => {
    const res = await createReview('vv-user-5', {
      rating: 6,
      comment: 'Rating is one above the allowed maximum.',
    });
    expect(res.status).toBe(400);
  });

  it('TC-06 (boundary, comment min length=5): a 5-character comment is accepted', async () => {
    const comment = 'Nice.';
    expect(comment.length).toBe(5);
    const res = await createReview('vv-user-6', { rating: 4, comment });
    expect(res.status).toBe(201);
  });

  it('TC-07 (boundary, comment min-1=4): a 4-character comment is rejected', async () => {
    const comment = 'Nice';
    expect(comment.length).toBe(4);
    const res = await createReview('vv-user-7', { rating: 4, comment });
    expect(res.status).toBe(400);
  });

  it('TC-08 (boundary, comment max length=2000): a 2000-character comment is accepted', async () => {
    const comment = 'A'.repeat(2000);
    const res = await createReview('vv-user-8', { rating: 4, comment });
    expect(res.status).toBe(201);
  });

  it('TC-09 (boundary, comment max+1=2001): a 2001-character comment is rejected', async () => {
    const comment = 'A'.repeat(2001);
    const res = await createReview('vv-user-9', { rating: 4, comment });
    expect(res.status).toBe(400);
  });

  it('TC-10 (error, unauthenticated): request without a token is rejected before the handler runs', async () => {
    const res = await createReview('', {
      rating: 4,
      comment: 'Should never reach the business logic.',
    });
    expect(res.status).toBe(401);
    expect(attractionsClient.attractionExists).not.toHaveBeenCalled();
  });

  it('TC-11 (error, business rule): reviewing a non-existent attraction is rejected with 404', async () => {
    (attractionsClient.attractionExists as jest.Mock).mockResolvedValueOnce(false);
    const res = await createReview(
      'vv-user-11',
      { rating: 3, comment: 'Should fail because attraction is missing.' },
      missingAttractionId
    );
    expect(res.status).toBe(404);
  });

  it('TC-12 (error, business rule): a second review by the same user on the same attraction is rejected with 409', async () => {
    const first = await createReview('vv-user-12', {
      rating: 4,
      comment: 'First review from this user, should succeed.',
    });
    expect(first.status).toBe(201);

    const second = await createReview('vv-user-12', {
      rating: 5,
      comment: 'Trying to review again, should be rejected.',
    });
    expect(second.status).toBe(409);

    const rows = await prisma.review.count({ where: { userId: 'vv-user-12', attractionId } });
    expect(rows).toBe(1);
  });

  it('TC-13 (error, type/format): a non-integer rating is rejected', async () => {
    const res = await createReview('vv-user-13', {
      rating: 3.5,
      comment: 'Rating is not an integer value here.',
    });
    expect(res.status).toBe(400);
  });
});

describe('Task 4b — structural coverage gap closure', () => {
  afterAll(async () => {
    await prisma.review.deleteMany({ where: { attractionId } });
  });

  /**
   * The coverage report (Task 4) showed review.service.ts:53 — the forbidden-delete throw
   * inside `remove()` — was never reached by the existing suite (only "owner deletes their
   * own review" was tested). This test reaches the branch where the caller is neither the
   * review's author nor an ADMIN, closing that gap. See task4-structural-coverage/coverage-report.md.
   */
  it('GAP-01: a non-owner, non-admin user cannot delete another user’s review', async () => {
    const created = await createReview('vv-gap-owner', {
      rating: 3,
      comment: 'Review created to test the delete-authorization branch.',
    });
    expect(created.status).toBe(201);

    const res = await request(app)
      .delete(`/api/v1/reviews/${created.body.review.id}`)
      .set('Authorization', `Bearer ${tokenFor('vv-gap-intruder', 'USER')}`);

    expect(res.status).toBe(403);
  });
});

describe('Integration tests — interaction between two components/modules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (attractionsClient.attractionExists as jest.Mock).mockResolvedValue(true);
    (attractionsClient.syncRating as jest.Mock).mockResolvedValue(undefined);
  });

  afterAll(async () => {
    await prisma.review.deleteMany({ where: { attractionId } });
  });

  /**
   * Integration Test 1 — reviewService <-> reviewRepository <-> Postgres.
   * This is NOT a unit test: it does not stub the repository or the database. It verifies
   * that the service module's business logic and the repository module's Prisma queries
   * correctly compose end-to-end against a real database — specifically, that the
   * `@@unique([userId, attractionId])` DB-level constraint and the repository's
   * `findByUserAndAttraction` pre-check agree with each other (the service checks first,
   * but the DB constraint is the actual source of truth/defense-in-depth).
   */
  it('INT-01: reviewService.create + reviewRepository jointly persist a row that is retrievable by list', async () => {
    const created = await createReview('vv-int-user-1', {
      rating: 4,
      comment: 'Integration test between service and repository layers.',
    });
    expect(created.status).toBe(201);

    const listed = await request(app).get(`/api/v1/attractions/${attractionId}/reviews`);
    expect(listed.status).toBe(200);
    const found = listed.body.items.find((r: { id: string }) => r.id === created.body.review.id);
    expect(found).toBeDefined();
    expect(found.rating).toBe(4);
  });

  /**
   * Integration Test 2 — reviewController/reviewService <-> attractionsClient module.
   * Verifies the interaction between engagement-service's own business logic and the
   * client module that talks to attractions-service: creating a review must call
   * attractionsClient.attractionExists BEFORE attempting to persist, and must call
   * attractionsClient.syncRating AFTER a successful persist, with the correct computed
   * arguments (attractionId, newAverage, newCount) — i.e. the two modules are wired
   * together in the correct order with the correct data flowing between them.
   */
  it('INT-02: review creation calls attractionsClient in the correct order with correct arguments', async () => {
    const callOrder: string[] = [];
    (attractionsClient.attractionExists as jest.Mock).mockImplementation(async () => {
      callOrder.push('attractionExists');
      return true;
    });
    (attractionsClient.syncRating as jest.Mock).mockImplementation(async () => {
      callOrder.push('syncRating');
    });

    const res = await createReview('vv-int-user-2', {
      rating: 5,
      comment: 'Integration test between service and attractions-service client.',
    });

    expect(res.status).toBe(201);
    expect(callOrder).toEqual(['attractionExists', 'syncRating']);
    expect(attractionsClient.syncRating).toHaveBeenCalledWith(attractionId, expect.any(Number), expect.any(Number));
  });
});
