import { Router } from 'express';
import { bookingRouter } from './booking.routes';

export const apiRouter = Router();

apiRouter.use('/bookings', bookingRouter);
