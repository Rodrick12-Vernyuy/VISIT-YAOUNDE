import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReviewSchema, listReviewsQuerySchema, updateReviewSchema } from '../validators/review.validator';

export const attractionReviewRouter = Router();

/**
 * @openapi
 * /attractions/{id}/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: List reviews for an attraction
 *     responses:
 *       200:
 *         description: Paginated reviews
 */
attractionReviewRouter.get('/:id/reviews', validate(listReviewsQuerySchema), reviewController.list);

/**
 * @openapi
 * /attractions/{id}/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Create a review for an attraction
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Review created
 */
attractionReviewRouter.post('/:id/reviews', authenticate, validate(createReviewSchema), reviewController.create);

export const reviewRouter = Router();

/**
 * @openapi
 * /reviews/{reviewId}:
 *   patch:
 *     tags: [Reviews]
 *     summary: Update your own review
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Review updated
 */
reviewRouter.patch('/:reviewId', authenticate, validate(updateReviewSchema), reviewController.update);

/**
 * @openapi
 * /reviews/{reviewId}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete your own review (or any review, as admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Review deleted
 */
reviewRouter.delete('/:reviewId', authenticate, reviewController.remove);

/**
 * @openapi
 * /reviews/{reviewId}/helpful:
 *   post:
 *     tags: [Reviews]
 *     summary: Toggle marking a review as helpful
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Helpful state toggled
 */
reviewRouter.post('/:reviewId/helpful', authenticate, reviewController.toggleHelpful);
