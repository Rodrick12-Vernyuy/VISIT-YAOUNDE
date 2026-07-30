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

/**
 * @openapi
 * /attractions:
 *   get:
 *     tags: [Attractions]
 *     summary: List published attractions with search, filters, and pagination
 *     responses:
 *       200:
 *         description: Paginated attraction list
 */
attractionRouter.get('/', validate(listAttractionsQuerySchema), attractionController.list);

/**
 * @openapi
 * /attractions/admin/all:
 *   get:
 *     tags: [Attractions]
 *     summary: List all attractions including unpublished drafts (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated attraction list including drafts
 */
attractionRouter.get(
  '/admin/all',
  authenticate,
  requireRole('ADMIN'),
  validate(listAttractionsQuerySchema),
  attractionController.listAdmin
);

/**
 * @openapi
 * /attractions/admin/{id}:
 *   get:
 *     tags: [Attractions]
 *     summary: Get an attraction by id, including unpublished drafts (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attraction detail
 */
attractionRouter.get('/admin/:id', authenticate, requireRole('ADMIN'), attractionController.getByIdAdmin);

/**
 * @openapi
 * /attractions/{slug}:
 *   get:
 *     tags: [Attractions]
 *     summary: Get an attraction by slug, with nearby attractions
 *     responses:
 *       200:
 *         description: Attraction detail
 */
attractionRouter.get('/:slug', attractionController.getBySlug);

/**
 * @openapi
 * /attractions:
 *   post:
 *     tags: [Attractions]
 *     summary: Create an attraction (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Attraction created
 */
attractionRouter.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  validate(createAttractionSchema),
  attractionController.create
);

/**
 * @openapi
 * /attractions/{id}:
 *   patch:
 *     tags: [Attractions]
 *     summary: Update an attraction (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attraction updated
 */
attractionRouter.patch(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  validate(updateAttractionSchema),
  attractionController.update
);

/**
 * @openapi
 * /attractions/{id}:
 *   delete:
 *     tags: [Attractions]
 *     summary: Delete an attraction (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Attraction deleted
 */
attractionRouter.delete('/:id', authenticate, requireRole('ADMIN'), attractionController.remove);

/**
 * @openapi
 * /attractions/{id}/gallery:
 *   post:
 *     tags: [Attractions]
 *     summary: Upload gallery images for an attraction (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Images uploaded
 */
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
