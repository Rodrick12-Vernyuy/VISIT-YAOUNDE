import { Router } from 'express';
import { itineraryController } from '../controllers/itinerary.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  addItemSchema,
  createItinerarySchema,
  updateItemSchema,
  updateItinerarySchema,
} from '../validators/itinerary.validator';

export const itineraryRouter = Router();

itineraryRouter.use(authenticate);

itineraryRouter.get('/', itineraryController.list);
itineraryRouter.post('/', validate(createItinerarySchema), itineraryController.create);
itineraryRouter.get('/:id', itineraryController.get);
itineraryRouter.patch('/:id', validate(updateItinerarySchema), itineraryController.update);
itineraryRouter.delete('/:id', itineraryController.remove);

itineraryRouter.post('/:id/items', validate(addItemSchema), itineraryController.addItem);
itineraryRouter.patch('/:id/items/:itemId', validate(updateItemSchema), itineraryController.updateItem);
itineraryRouter.delete('/:id/items/:itemId', itineraryController.removeItem);
