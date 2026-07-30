import { Request, Response } from 'express';
import { reviewService } from '../services/review.service';
import { asyncHandler } from '../utils/asyncHandler';

export const reviewController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(parseInt((req.query.page as string) ?? '1', 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt((req.query.pageSize as string) ?? '10', 10) || 10, 1), 50);
    const result = await reviewService.listForAttraction(req.params.id, page, pageSize);
    res.status(200).json(result);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.create(req.user!.sub, req.params.id, req.body);
    res.status(201).json({ review });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.update(req.user!.sub, req.params.reviewId, req.body);
    res.status(200).json({ review });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await reviewService.remove(req.user!.sub, req.user!.role, req.params.reviewId);
    res.status(204).send();
  }),

  toggleHelpful: asyncHandler(async (req: Request, res: Response) => {
    const result = await reviewService.toggleHelpful(req.user!.sub, req.params.reviewId);
    res.status(200).json(result);
  }),
};
