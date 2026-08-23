import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { asyncHandler } from '../utils/asyncHandler';

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(parseInt((req.query.page as string) ?? '1', 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt((req.query.pageSize as string) ?? '20', 10) || 20, 1), 100);
    const result = await notificationService.listForUser(req.user!.sub, page, pageSize);
    res.status(200).json(result);
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.markRead(req.params.id, req.user!.sub);
    res.status(200).json({ notification });
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAllRead(req.user!.sub);
    res.status(204).send();
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await notificationService.remove(req.params.id, req.user!.sub);
    res.status(204).send();
  }),
};
