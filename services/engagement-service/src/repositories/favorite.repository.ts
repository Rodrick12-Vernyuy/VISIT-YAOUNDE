import { prisma } from '../config/prisma';

export const favoriteRepository = {
  findByUser(userId: string) {
    return prisma.favorite.findMany({
      where: { userId },
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
};
