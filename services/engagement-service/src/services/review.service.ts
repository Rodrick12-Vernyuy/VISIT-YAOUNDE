import { reviewRepository } from '../repositories/review.repository';
import { attractionsClient } from '../clients/attractionsClient';
import { authClient } from '../clients/authClient';
import { ApiError } from '../utils/ApiError';

async function syncAttractionRating(attractionId: string) {
  const aggregate = await reviewRepository.aggregateForAttraction(attractionId);
  await attractionsClient.syncRating(attractionId, aggregate._avg.rating ?? 0, aggregate._count);
}

const FALLBACK_USER = { fullName: 'Visit Yaoundé user', avatarUrl: null as string | null };

export const reviewService = {
  async listForAttraction(attractionId: string, page: number, pageSize: number) {
    const [items, total] = await reviewRepository.findByAttraction(attractionId, page, pageSize);

    const userIds = [...new Set(items.map((review) => review.userId))];
    const users = await authClient.getUsersByIds(userIds);
    const enriched = items.map((review) => ({
      ...review,
      user: users.get(review.userId) ?? { id: review.userId, ...FALLBACK_USER },
    }));

    return { items: enriched, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  },

  async create(userId: string, attractionId: string, input: { rating: number; comment: string }) {
    const exists = await attractionsClient.attractionExists(attractionId);
    if (!exists) throw ApiError.notFound('Attraction not found');

    const existing = await reviewRepository.findByUserAndAttraction(userId, attractionId);
    if (existing) throw ApiError.conflict('You have already reviewed this attraction');

    const review = await reviewRepository.create({ userId, attractionId, rating: input.rating, comment: input.comment });
    await syncAttractionRating(attractionId);
    return review;
  },

  async update(userId: string, reviewId: string, input: { rating?: number; comment?: string }) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw ApiError.notFound('Review not found');
    if (review.userId !== userId) throw ApiError.forbidden('You can only edit your own review');

    const updated = await reviewRepository.update(reviewId, input);
    await syncAttractionRating(review.attractionId);
    return updated;
  },

  async remove(userId: string, role: 'ADMIN' | 'USER', reviewId: string) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw ApiError.notFound('Review not found');
    if (review.userId !== userId && role !== 'ADMIN') {
      throw ApiError.forbidden('You can only delete your own review');
    }

    await reviewRepository.delete(reviewId);
    await syncAttractionRating(review.attractionId);
  },

  async toggleHelpful(userId: string, reviewId: string) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw ApiError.notFound('Review not found');
    if (review.userId === userId) throw ApiError.badRequest('You cannot vote on your own review');

    return reviewRepository.toggleHelpful(reviewId, userId);
  },
};
