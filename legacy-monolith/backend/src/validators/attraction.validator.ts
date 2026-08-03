import { z } from 'zod';

const attractionBody = z.object({
  name: z.string().min(2).max(160),
  shortDescription: z.string().min(10).max(280),
  description: z.string().min(20),
  history: z.string().optional(),
  district: z.string().min(2),
  address: z.string().min(2),
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180),
  openingHours: z.string().min(2),
  entryFee: z.string().min(1),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  estimatedVisitDuration: z.string().optional(),
  bestVisitingTime: z.string().optional(),
  safetyInfo: z.string().optional(),
  accessibilityInfo: z.string().optional(),
  visitorTips: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  categoryId: z.string().uuid(),
});

export const createAttractionSchema = z.object({
  body: attractionBody,
  query: z.any().optional(),
  params: z.any().optional(),
});

export const updateAttractionSchema = z.object({
  body: attractionBody.partial(),
  query: z.any().optional(),
  params: z.object({ id: z.string().uuid() }),
});

export const listAttractionsQuerySchema = z.object({
  body: z.any().optional(),
  query: z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    district: z.string().optional(),
    featured: z.enum(['true', 'false']).optional(),
    sort: z.enum(['newest', 'name']).optional(),
    page: z.string().regex(/^\d+$/).optional(),
    pageSize: z.string().regex(/^\d+$/).optional(),
  }),
  params: z.any().optional(),
});
