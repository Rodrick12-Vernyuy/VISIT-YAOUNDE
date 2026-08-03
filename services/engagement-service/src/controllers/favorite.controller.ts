import { Request, Response } from 'express';
import { favoriteService } from '../services/favorite.service';
import { asyncHandler } from '../utils/asyncHandler';

export const favoriteController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const favorites = await favoriteService.listForUser(req.user!.sub);
    res.status(200).json({ favorites });
  }),

  add: asyncHandler(async (req: Request, res: Response) => {
    const favorite = await favoriteService.add(req.user!.sub, req.params.attractionId);
    res.status(201).json({ favorite });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await favoriteService.remove(req.user!.sub, req.params.attractionId);
    res.status(204).send();
  }),
};
