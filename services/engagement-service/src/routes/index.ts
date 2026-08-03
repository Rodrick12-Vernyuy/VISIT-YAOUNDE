import { Router } from 'express';
import { attractionReviewRouter, reviewRouter } from './review.routes';
import { favoriteRouter } from './favorite.routes';

export const apiRouter = Router();

apiRouter.use('/attractions', attractionReviewRouter);
apiRouter.use('/reviews', reviewRouter);
apiRouter.use('/favorites', favoriteRouter);
