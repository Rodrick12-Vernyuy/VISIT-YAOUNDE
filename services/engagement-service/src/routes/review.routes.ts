import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReviewSchema, listReviewsQuerySchema, updateReviewSchema } from '../validators/review.validator';

export const attractionReviewRouter = Router();

attractionReviewRouter.get('/:id/reviews', validate(listReviewsQuerySchema), reviewController.list);
attractionReviewRouter.post('/:id/reviews', authenticate, validate(createReviewSchema), reviewController.create);

export const reviewRouter = Router();

reviewRouter.patch('/:reviewId', authenticate, validate(updateReviewSchema), reviewController.update);
reviewRouter.delete('/:reviewId', authenticate, reviewController.remove);
reviewRouter.post('/:reviewId/helpful', authenticate, reviewController.toggleHelpful);
