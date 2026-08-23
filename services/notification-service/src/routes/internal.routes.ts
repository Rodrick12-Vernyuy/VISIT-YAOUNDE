import { Router } from 'express';
import { internalController } from '../controllers/internal.controller';
import { requireInternalService } from '../middleware/internalAuth';
import { validate } from '../middleware/validate';
import { createNotificationSchema } from '../validators/notification.validator';

export const internalRouter = Router();

internalRouter.use(requireInternalService);

internalRouter.post('/notifications', validate(createNotificationSchema), internalController.create);
