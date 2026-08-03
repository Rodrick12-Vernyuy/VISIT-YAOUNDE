import { prisma } from '../config/prisma';

export const reviewRepository = {
  findByAttraction(attractionId: string, page: number, pageSize: number) {
    return Promise.all([
      prisma.review.findMany({
        where: { attractionId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.review.count({ where: { attractionId } }),
    ]);
  },

  findById(id: string) {
    return prisma.review.findUnique({ where: { id } });
  },

  findByUserAndAttraction(userId: string, attractionId: string) {
    return prisma.review.findUnique({ where: { userId_attractionId: { userId, attractionId } } });
  },

  create(data: { userId: string; attractionId: string; rating: number; comment: string }) {
    return prisma.review.create({ data });
  },

  update(id: string, data: { rating?: number; comment?: string }) {
    return prisma.review.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.review.delete({ where: { id } });
  },

  aggregateForAttraction(attractionId: string) {
    return prisma.review.aggregate({
      where: { attractionId },
      _avg: { rating: true },
      _count: true,
    });
  },

  async toggleHelpful(reviewId: string, userId: string) {
    const existing = await prisma.reviewHelpful.findUnique({
      where: { reviewId_userId: { reviewId, userId } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.reviewHelpful.delete({ where: { id: existing.id } }),
        prisma.review.update({ where: { id: reviewId }, data: { helpfulCount: { decrement: 1 } } }),
      ]);
      return { helpful: false };
    }

    await prisma.$transaction([
      prisma.reviewHelpful.create({ data: { reviewId, userId } }),
      prisma.review.update({ where: { id: reviewId }, data: { helpfulCount: { increment: 1 } } }),
    ]);
    return { helpful: true };
  },
};
