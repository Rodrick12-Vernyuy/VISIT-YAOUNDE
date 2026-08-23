import { Request, Response } from 'express';
import { itineraryService } from '../services/itinerary.service';
import { asyncHandler } from '../utils/asyncHandler';

export const itineraryController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const itineraries = await itineraryService.listForUser(req.user!.sub);
    res.status(200).json({ itineraries });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const itinerary = await itineraryService.getOwned(req.params.id, req.user!.sub);
    res.status(200).json({ itinerary });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const itinerary = await itineraryService.create(req.user!.sub, req.body);
    res.status(201).json({ itinerary });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const itinerary = await itineraryService.update(req.params.id, req.user!.sub, req.body);
    res.status(200).json({ itinerary });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await itineraryService.remove(req.params.id, req.user!.sub);
    res.status(204).send();
  }),

  addItem: asyncHandler(async (req: Request, res: Response) => {
    const item = await itineraryService.addItem(req.params.id, req.user!.sub, req.body);
    res.status(201).json({ item });
  }),

  updateItem: asyncHandler(async (req: Request, res: Response) => {
    const item = await itineraryService.updateItem(req.params.id, req.params.itemId, req.user!.sub, req.body);
    res.status(200).json({ item });
  }),

  removeItem: asyncHandler(async (req: Request, res: Response) => {
    await itineraryService.removeItem(req.params.id, req.params.itemId, req.user!.sub);
    res.status(204).send();
  }),
};
