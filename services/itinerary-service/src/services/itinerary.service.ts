import { itineraryRepository } from '../repositories/itinerary.repository';
import { attractionsClient } from '../clients/attractionsClient';
import { ApiError } from '../utils/ApiError';

async function getOwnedOrThrow(id: string, userId: string) {
  const itinerary = await itineraryRepository.findOwned(id, userId);
  if (!itinerary) throw ApiError.notFound('Itinerary not found');
  return itinerary;
}

export const itineraryService = {
  listForUser(userId: string) {
    return itineraryRepository.findByUser(userId);
  },

  getOwned: getOwnedOrThrow,

  create(userId: string, input: { title: string; description?: string; startDate: string; endDate: string }) {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    if (endDate < startDate) throw ApiError.badRequest('endDate cannot be before startDate');

    return itineraryRepository.create(userId, {
      title: input.title,
      description: input.description,
      startDate,
      endDate,
    });
  },

  async update(
    id: string,
    userId: string,
    input: Partial<{ title: string; description: string; startDate: string; endDate: string }>
  ) {
    await getOwnedOrThrow(id, userId);
    return itineraryRepository.update(id, {
      title: input.title,
      description: input.description,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
    });
  },

  async remove(id: string, userId: string) {
    await getOwnedOrThrow(id, userId);
    await itineraryRepository.delete(id);
  },

  async addItem(
    itineraryId: string,
    userId: string,
    input: { attractionId: string; dayNumber: number; order: number; notes?: string }
  ) {
    await getOwnedOrThrow(itineraryId, userId);

    const exists = await attractionsClient.attractionExists(input.attractionId);
    if (!exists) throw ApiError.notFound('Attraction not found');

    return itineraryRepository.addItem(itineraryId, input);
  },

  async updateItem(
    itineraryId: string,
    itemId: string,
    userId: string,
    input: Partial<{ dayNumber: number; order: number; notes: string }>
  ) {
    await getOwnedOrThrow(itineraryId, userId);
    const item = await itineraryRepository.findItem(itemId, itineraryId);
    if (!item) throw ApiError.notFound('Itinerary item not found');
    return itineraryRepository.updateItem(itemId, input);
  },

  async removeItem(itineraryId: string, itemId: string, userId: string) {
    await getOwnedOrThrow(itineraryId, userId);
    const item = await itineraryRepository.findItem(itemId, itineraryId);
    if (!item) throw ApiError.notFound('Itinerary item not found');
    await itineraryRepository.removeItem(itemId);
  },
};
