import { Request, Response } from 'express';
import { attractionService } from '../services/attraction.service';
import { asyncHandler } from '../utils/asyncHandler';

export const internalController = {
  checkExists: asyncHandler(async (req: Request, res: Response) => {
    const exists = await attractionService.exists(req.params.id);
    res.status(200).json({ exists });
  }),

  syncRating: asyncHandler(async (req: Request, res: Response) => {
    const { averageRating, reviewCount } = req.body;
    await attractionService.syncRating(req.params.id, averageRating, reviewCount);
    res.status(200).json({ ok: true });
  }),
};
