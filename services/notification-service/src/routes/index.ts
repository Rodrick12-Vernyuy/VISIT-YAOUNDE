import { Router } from 'express';
import { notificationRouter } from './notification.routes';

export const apiRouter = Router();

apiRouter.use('/notifications', notificationRouter);
