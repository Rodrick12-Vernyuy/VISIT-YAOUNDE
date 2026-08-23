import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

export const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.get('/', notificationController.list);
notificationRouter.patch('/read-all', notificationController.markAllRead);
notificationRouter.patch('/:id/read', notificationController.markRead);
notificationRouter.delete('/:id', notificationController.remove);
