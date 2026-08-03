import { Router } from 'express';
import { attractionController } from '../controllers/attraction.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { imageUpload } from '../middleware/upload';
import {
  createAttractionSchema,
  listAttractionsQuerySchema,
  updateAttractionSchema,
} from '../validators/attraction.validator';

export const attractionRouter = Router();

attractionRouter.get('/', validate(listAttractionsQuerySchema), attractionController.list);
attractionRouter.get(
  '/admin/all',
  authenticate,
  requireRole('ADMIN'),
  validate(listAttractionsQuerySchema),
  attractionController.listAdmin
);
attractionRouter.get('/admin/:id', authenticate, requireRole('ADMIN'), attractionController.getByIdAdmin);
attractionRouter.get('/:slug', attractionController.getBySlug);

attractionRouter.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  validate(createAttractionSchema),
  attractionController.create
);
attractionRouter.patch(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  validate(updateAttractionSchema),
  attractionController.update
);
attractionRouter.delete('/:id', authenticate, requireRole('ADMIN'), attractionController.remove);

attractionRouter.post(
  '/:id/gallery',
  authenticate,
  requireRole('ADMIN'),
  imageUpload.array('images', 10),
  attractionController.uploadGallery
);
attractionRouter.patch(
  '/:id/gallery/:imageId/cover',
  authenticate,
  requireRole('ADMIN'),
  attractionController.setCoverImage
);
attractionRouter.delete(
  '/:id/gallery/:imageId',
  authenticate,
  requireRole('ADMIN'),
  attractionController.removeImage
);
