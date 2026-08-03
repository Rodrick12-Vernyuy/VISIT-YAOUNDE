import { Router } from 'express';
import { favoriteController } from '../controllers/favorite.controller';
import { authenticate } from '../middleware/auth';

export const favoriteRouter = Router();

favoriteRouter.use(authenticate);

favoriteRouter.get('/', favoriteController.list);
favoriteRouter.post('/:attractionId', favoriteController.add);
favoriteRouter.delete('/:attractionId', favoriteController.remove);
