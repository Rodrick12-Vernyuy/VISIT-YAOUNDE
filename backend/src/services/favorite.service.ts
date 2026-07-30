import { attractionRepository } from '../repositories/attraction.repository';
import { favoriteRepository } from '../repositories/favorite.repository';
import { ApiError } from '../utils/ApiError';

export const favoriteService = {
  listForUser(userId: string) {
    return favoriteRepository.findByUser(userId);
  },

  async add(userId: string, attractionId: string) {
    const attraction = await attractionRepository.findById(attractionId);
    if (!attraction) throw ApiError.notFound('Attraction not found');

    const existing = await favoriteRepository.find(userId, attractionId);
    if (existing) return existing;

    return favoriteRepository.create(userId, attractionId);
  },

  async remove(userId: string, attractionId: string) {
    const existing = await favoriteRepository.find(userId, attractionId);
    if (!existing) return;
    await favoriteRepository.delete(existing.id);
  },
};
