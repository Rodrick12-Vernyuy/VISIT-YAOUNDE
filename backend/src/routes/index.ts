import { Router } from 'express';
import { authRouter } from './auth.routes';
import { categoryRouter } from './category.routes';
import { attractionRouter } from './attraction.routes';
import { attractionReviewRouter, reviewRouter } from './review.routes';
import { favoriteRouter } from './favorite.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/attractions', attractionRouter);
apiRouter.use('/attractions', attractionReviewRouter);
apiRouter.use('/reviews', reviewRouter);
apiRouter.use('/favorites', favoriteRouter);
