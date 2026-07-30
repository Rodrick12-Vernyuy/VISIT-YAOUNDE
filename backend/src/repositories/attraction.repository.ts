import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface AttractionListFilters {
  q?: string;
  categorySlug?: string;
  district?: string;
  featured?: boolean;
  sort?: 'newest' | 'name';
  page: number;
  pageSize: number;
  includeUnpublished?: boolean;
}

const includeRelations = {
  category: true,
  images: { orderBy: { position: 'asc' as const } },
};

export const attractionRepository = {
  async list(filters: AttractionListFilters) {
    const where: Prisma.AttractionWhereInput = {
      ...(filters.includeUnpublished ? {} : { isPublished: true }),
      ...(filters.district ? { district: { equals: filters.district, mode: 'insensitive' } } : {}),
      ...(filters.featured !== undefined ? { isFeatured: filters.featured } : {}),
      ...(filters.categorySlug ? { category: { slug: filters.categorySlug } } : {}),
      ...(filters.q
        ? {
            OR: [
              { name: { contains: filters.q, mode: 'insensitive' } },
              { shortDescription: { contains: filters.q, mode: 'insensitive' } },
              { district: { contains: filters.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.AttractionOrderByWithRelationInput =
      filters.sort === 'name' ? { name: 'asc' } : { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      prisma.attraction.findMany({
        where,
        include: includeRelations,
        orderBy,
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.attraction.count({ where }),
    ]);

    return { items, total };
  },

  findBySlug(slug: string) {
    return prisma.attraction.findUnique({ where: { slug }, include: includeRelations });
  },

  findById(id: string) {
    return prisma.attraction.findUnique({ where: { id }, include: includeRelations });
  },

  findNearby(attraction: { id: string; categoryId: string; district: string }, take = 4) {
    return prisma.attraction.findMany({
      where: {
        id: { not: attraction.id },
        isPublished: true,
        OR: [{ categoryId: attraction.categoryId }, { district: attraction.district }],
      },
      include: includeRelations,
      take,
    });
  },

  create(data: Prisma.AttractionCreateInput) {
    return prisma.attraction.create({ data, include: includeRelations });
  },

  update(id: string, data: Prisma.AttractionUpdateInput) {
    return prisma.attraction.update({ where: { id }, data, include: includeRelations });
  },

  delete(id: string) {
    return prisma.attraction.delete({ where: { id } });
  },

  addImage(data: Prisma.AttractionImageCreateInput) {
    return prisma.attractionImage.create({ data });
  },

  findImageById(id: string) {
    return prisma.attractionImage.findUnique({ where: { id } });
  },

  deleteImage(id: string) {
    return prisma.attractionImage.delete({ where: { id } });
  },

  unsetCoverImages(attractionId: string) {
    return prisma.attractionImage.updateMany({ where: { attractionId }, data: { isCover: false } });
  },

  setCoverImage(id: string) {
    return prisma.attractionImage.update({ where: { id }, data: { isCover: true } });
  },
};
