import { prisma } from '../config/prisma';

const includeAttraction = {
  attraction: {
    include: { category: true, images: { orderBy: { position: 'asc' as const } } },
  },
};

export const favoriteRepository = {
  findByUser(userId: string) {
    return prisma.favorite.findMany({
      where: { userId },
      include: includeAttraction,
      orderBy: { createdAt: 'desc' },
    });
  },

  find(userId: string, attractionId: string) {
    return prisma.favorite.findUnique({ where: { userId_attractionId: { userId, attractionId } } });
  },

  create(userId: string, attractionId: string) {
    return prisma.favorite.create({ data: { userId, attractionId } });
  },

  delete(id: string) {
    return prisma.favorite.delete({ where: { id } });
  },

  findAttractionIdsFavoritedByUser(userId: string, attractionIds: string[]) {
    return prisma.favorite.findMany({
      where: { userId, attractionId: { in: attractionIds } },
      select: { attractionId: true },
    });
  },
};
