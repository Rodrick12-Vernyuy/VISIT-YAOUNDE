import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBookingSchema, updateBookingSchema } from '../validators/booking.validator';

export const bookingRouter = Router();

bookingRouter.use(authenticate);

bookingRouter.get('/', bookingController.list);
bookingRouter.post('/', validate(createBookingSchema), bookingController.create);
bookingRouter.get('/:id', bookingController.get);
bookingRouter.patch('/:id', validate(updateBookingSchema), bookingController.update);
bookingRouter.patch('/:id/cancel', bookingController.cancel);
