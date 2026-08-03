import slugify from 'slugify';
import { attractionRepository } from '../repositories/attraction.repository';
import { categoryRepository } from '../repositories/category.repository';
import { ApiError } from '../utils/ApiError';
import { storeImage, deleteImage } from './upload.service';

interface AttractionInput {
  name: string;
  shortDescription: string;
  description: string;
  history?: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  entryFee: string;
  contactPhone?: string;
  contactEmail?: string;
  estimatedVisitDuration?: string;
  bestVisitingTime?: string;
  safetyInfo?: string;
  accessibilityInfo?: string;
  visitorTips?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  categoryId: string;
}

async function ensureCategoryExists(categoryId: string) {
  const category = await categoryRepository.findAll();
  if (!category.some((c) => c.id === categoryId)) {
    throw ApiError.badRequest('Unknown categoryId');
  }
}

async function uniqueSlug(name: string) {
  const base = slugify(name, { lower: true, strict: true });
  let candidate = base;
  let suffix = 1;
  while (await attractionRepository.findBySlug(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}

export const attractionService = {
  async list(
    query: {
      q?: string;
      category?: string;
      district?: string;
      featured?: string;
      sort?: 'newest' | 'name';
      page?: string;
      pageSize?: string;
    },
    options: { includeUnpublished?: boolean } = {}
  ) {
    const page = Math.max(parseInt(query.page ?? '1', 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(query.pageSize ?? '12', 10) || 12, 1), 50);

    const { items, total } = await attractionRepository.list({
      q: query.q,
      categorySlug: query.category,
      district: query.district,
      featured: query.featured === undefined ? undefined : query.featured === 'true',
      sort: query.sort,
      page,
      pageSize,
      includeUnpublished: options.includeUnpublished,
    });

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  },

  async getBySlug(slug: string) {
    const attraction = await attractionRepository.findBySlug(slug);
    if (!attraction) throw ApiError.notFound('Attraction not found');
    const nearby = await attractionRepository.findNearby(attraction);
    return { attraction, nearby };
  },

  async getById(id: string) {
    const attraction = await attractionRepository.findById(id);
    if (!attraction) throw ApiError.notFound('Attraction not found');
    return attraction;
  },

  async create(input: AttractionInput, createdById: string) {
    await ensureCategoryExists(input.categoryId);
    const slug = await uniqueSlug(input.name);
    return attractionRepository.create({
      name: input.name,
      slug,
      shortDescription: input.shortDescription,
      description: input.description,
      history: input.history,
      district: input.district,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      openingHours: input.openingHours,
      entryFee: input.entryFee,
      contactPhone: input.contactPhone,
      contactEmail: input.contactEmail,
      estimatedVisitDuration: input.estimatedVisitDuration,
      bestVisitingTime: input.bestVisitingTime,
      safetyInfo: input.safetyInfo,
      accessibilityInfo: input.accessibilityInfo,
      visitorTips: input.visitorTips,
      isFeatured: input.isFeatured ?? false,
      isPublished: input.isPublished ?? true,
      category: { connect: { id: input.categoryId } },
      createdBy: { connect: { id: createdById } },
    });
  },

  async update(id: string, input: Partial<AttractionInput>) {
    const existing = await attractionRepository.findById(id);
    if (!existing) throw ApiError.notFound('Attraction not found');

    const { categoryId, ...rest } = input;
    if (categoryId) await ensureCategoryExists(categoryId);

    const slug = rest.name && rest.name !== existing.name ? await uniqueSlug(rest.name) : undefined;

    return attractionRepository.update(id, {
      ...rest,
      ...(slug ? { slug } : {}),
      ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
    });
  },

  async remove(id: string) {
    const existing = await attractionRepository.findById(id);
    if (!existing) throw ApiError.notFound('Attraction not found');
    await Promise.all(existing.images.map((image) => deleteImage(image.publicId)));
    await attractionRepository.delete(id);
  },

  async addImages(attractionId: string, files: Express.Multer.File[]) {
    const attraction = await attractionRepository.findById(attractionId);
    if (!attraction) throw ApiError.notFound('Attraction not found');

    const hasCover = attraction.images.some((image) => image.isCover);
    const created = [];
    for (const [index, file] of files.entries()) {
      const uploaded = await storeImage(file);
      const image = await attractionRepository.addImage({
        url: uploaded.url,
        publicId: uploaded.publicId,
        isCover: !hasCover && index === 0,
        position: attraction.images.length + index,
        attraction: { connect: { id: attractionId } },
      });
      created.push(image);
    }
    return created;
  },

  async setCoverImage(attractionId: string, imageId: string) {
    const image = await attractionRepository.findImageById(imageId);
    if (!image || image.attractionId !== attractionId) throw ApiError.notFound('Image not found');
    await attractionRepository.unsetCoverImages(attractionId);
    return attractionRepository.setCoverImage(imageId);
  },

  async removeImage(attractionId: string, imageId: string) {
    const image = await attractionRepository.findImageById(imageId);
    if (!image || image.attractionId !== attractionId) throw ApiError.notFound('Image not found');
    await deleteImage(image.publicId);
    await attractionRepository.deleteImage(imageId);
  },
};
