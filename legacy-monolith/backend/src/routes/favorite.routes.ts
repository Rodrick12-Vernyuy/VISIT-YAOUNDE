import { Router } from 'express';
import { favoriteController } from '../controllers/favorite.controller';
import { authenticate } from '../middleware/auth';

export const favoriteRouter = Router();

favoriteRouter.use(authenticate);

/**
 * @openapi
 * /favorites:
 *   get:
 *     tags: [Favorites]
 *     summary: List the current user's favorite attractions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorites
 */
favoriteRouter.get('/', favoriteController.list);

/**
 * @openapi
 * /favorites/{attractionId}:
 *   post:
 *     tags: [Favorites]
 *     summary: Save an attraction to favorites
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Favorite added
 */
favoriteRouter.post('/:attractionId', favoriteController.add);

/**
 * @openapi
 * /favorites/{attractionId}:
 *   delete:
 *     tags: [Favorites]
 *     summary: Remove an attraction from favorites
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Favorite removed
 */
favoriteRouter.delete('/:attractionId', favoriteController.remove);
