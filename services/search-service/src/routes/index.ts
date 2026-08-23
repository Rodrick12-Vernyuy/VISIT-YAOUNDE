import { Router } from 'express';
import { searchRouter } from './search.routes';

export const apiRouter = Router();

apiRouter.use('/search', searchRouter);
