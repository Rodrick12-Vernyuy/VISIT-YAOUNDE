import { prisma } from '../config/prisma';

export const categoryRepository = {
  findAll() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } });
  },
  findBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } });
  },
};
