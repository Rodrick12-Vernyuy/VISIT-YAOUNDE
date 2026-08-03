import { attractionRepository } from '../repositories/attraction.repository';
import { reviewRepository } from '../repositories/review.repository';
import { ApiError } from '../utils/ApiError';

export const reviewService = {
  async listForAttraction(attractionId: string, page: number, pageSize: number) {
    const [items, total] = await reviewRepository.findByAttraction(attractionId, page, pageSize);
    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  },

  async create(userId: string, attractionId: string, input: { rating: number; comment: string }) {
    const attraction = await attractionRepository.findById(attractionId);
    if (!attraction) throw ApiError.notFound('Attraction not found');

    const existing = await reviewRepository.findByUserAndAttraction(userId, attractionId);
    if (existing) throw ApiError.conflict('You have already reviewed this attraction');

    return reviewRepository.create({ userId, attractionId, rating: input.rating, comment: input.comment });
  },

  async update(userId: string, reviewId: string, input: { rating?: number; comment?: string }) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw ApiError.notFound('Review not found');
    if (review.userId !== userId) throw ApiError.forbidden('You can only edit your own review');

    return reviewRepository.update(reviewId, review.attractionId, input);
  },

  async remove(userId: string, role: 'ADMIN' | 'USER', reviewId: string) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw ApiError.notFound('Review not found');
    if (review.userId !== userId && role !== 'ADMIN') {
      throw ApiError.forbidden('You can only delete your own review');
    }

    await reviewRepository.delete(reviewId, review.attractionId);
  },

  async toggleHelpful(userId: string, reviewId: string) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw ApiError.notFound('Review not found');
    if (review.userId === userId) throw ApiError.badRequest('You cannot vote on your own review');

    return reviewRepository.toggleHelpful(reviewId, userId);
  },
};
