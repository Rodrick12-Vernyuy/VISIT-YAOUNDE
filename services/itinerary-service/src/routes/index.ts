import { Router } from 'express';
import { itineraryRouter } from './itinerary.routes';

export const apiRouter = Router();

apiRouter.use('/itineraries', itineraryRouter);
