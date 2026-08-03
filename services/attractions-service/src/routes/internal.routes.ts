import { Router } from 'express';
import { internalController } from '../controllers/internal.controller';
import { requireInternalService } from '../middleware/internalAuth';
import { validate } from '../middleware/validate';
import { updateRatingSchema } from '../validators/attraction.validator';

export const internalRouter = Router();

internalRouter.use(requireInternalService);

internalRouter.get('/attractions/:id/exists', internalController.checkExists);
internalRouter.patch('/attractions/:id/rating', validate(updateRatingSchema), internalController.syncRating);
