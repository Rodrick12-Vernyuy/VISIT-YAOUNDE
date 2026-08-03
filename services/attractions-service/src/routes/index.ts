import { Router } from 'express';
import { categoryRouter } from './category.routes';
import { attractionRouter } from './attraction.routes';

export const apiRouter = Router();

apiRouter.use('/categories', categoryRouter);
apiRouter.use('/attractions', attractionRouter);
