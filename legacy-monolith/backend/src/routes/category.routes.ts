import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';

export const categoryRouter = Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all attraction categories
 *     responses:
 *       200:
 *         description: List of categories
 */
categoryRouter.get('/', categoryController.list);
