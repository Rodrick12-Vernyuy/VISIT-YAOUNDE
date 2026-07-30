import { Request, Response } from 'express';
import { attractionService } from '../services/attraction.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const attractionController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await attractionService.list(req.query as Record<string, string>);
    res.status(200).json(result);
  }),

  listAdmin: asyncHandler(async (req: Request, res: Response) => {
    const result = await attractionService.list(req.query as Record<string, string>, { includeUnpublished: true });
    res.status(200).json(result);
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const result = await attractionService.getBySlug(req.params.slug);
    res.status(200).json(result);
  }),

  getByIdAdmin: asyncHandler(async (req: Request, res: Response) => {
    const attraction = await attractionService.getById(req.params.id);
    res.status(200).json({ attraction });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const attraction = await attractionService.create(req.body, req.user!.sub);
    res.status(201).json({ attraction });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const attraction = await attractionService.update(req.params.id, req.body);
    res.status(200).json({ attraction });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await attractionService.remove(req.params.id);
    res.status(204).send();
  }),

  uploadGallery: asyncHandler(async (req: Request, res: Response) => {
    const files = (req.files as Express.Multer.File[]) ?? [];
    if (!files.length) throw ApiError.badRequest('No images provided');
    const images = await attractionService.addImages(req.params.id, files);
    res.status(201).json({ images });
  }),

  setCoverImage: asyncHandler(async (req: Request, res: Response) => {
    const image = await attractionService.setCoverImage(req.params.id, req.params.imageId);
    res.status(200).json({ image });
  }),

  removeImage: asyncHandler(async (req: Request, res: Response) => {
    await attractionService.removeImage(req.params.id, req.params.imageId);
    res.status(204).send();
  }),
};
