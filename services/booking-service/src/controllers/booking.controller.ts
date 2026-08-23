import { Request, Response } from 'express';
import { bookingService } from '../services/booking.service';
import { asyncHandler } from '../utils/asyncHandler';

export const bookingController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const bookings = await bookingService.listForUser(req.user!.sub);
    res.status(200).json({ bookings });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.getOwned(req.params.id, req.user!.sub);
    res.status(200).json({ booking });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.create(req.user!.sub, req.body);
    res.status(201).json({ booking });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.update(req.params.id, req.user!.sub, req.body);
    res.status(200).json({ booking });
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.cancel(req.params.id, req.user!.sub);
    res.status(200).json({ booking });
  }),
};
