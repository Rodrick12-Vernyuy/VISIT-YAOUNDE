import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { validate } from '../middleware/validate';
import { searchQuerySchema } from '../validators/search.validator';

export const searchRouter = Router();

searchRouter.get('/', validate(searchQuerySchema), searchController.search);
