import { Router } from 'express';
import { internalController } from '../controllers/internal.controller';
import { requireInternalService } from '../middleware/internalAuth';

export const internalRouter = Router();

internalRouter.use(requireInternalService);

internalRouter.get('/users', internalController.listByIds);
