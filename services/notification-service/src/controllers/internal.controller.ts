import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { asyncHandler } from '../utils/asyncHandler';

export const internalController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.create(req.body);
    res.status(201).json({ notification });
  }),
};
