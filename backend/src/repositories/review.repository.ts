import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export const reviewRepository = {
  findByAttraction(attractionId: string, page: number, pageSize: number) {
    return Promise.all([
      prisma.review.findMany({
        where: { attractionId },
        include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
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

  async create(data: { userId: string; attractionId: string; rating: number; comment: string }) {
    return prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data,
        include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
      });
      await recalculateAttractionRating(tx, data.attractionId);
      return review;
    });
  },

  async update(id: string, attractionId: string, data: { rating?: number; comment?: string }) {
    return prisma.$transaction(async (tx) => {
      const review = await tx.review.update({
        where: { id },
        data,
        include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
      });
      await recalculateAttractionRating(tx, attractionId);
      return review;
    });
  },

  async delete(id: string, attractionId: string) {
    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id } });
      await recalculateAttractionRating(tx, attractionId);
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

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function recalculateAttractionRating(tx: Tx, attractionId: string) {
  const aggregate = await tx.review.aggregate({
    where: { attractionId },
    _avg: { rating: true },
    _count: true,
  });

  await tx.attraction.update({
    where: { id: attractionId },
    data: {
      averageRating: aggregate._avg.rating ?? 0,
      reviewCount: aggregate._count,
    },
  });
}
