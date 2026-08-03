import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(5).max(2000),
  }),
  query: z.any().optional(),
  params: z.object({ id: z.string().uuid() }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().min(5).max(2000).optional(),
  }),
  query: z.any().optional(),
  params: z.object({ reviewId: z.string().uuid() }),
});

export const listReviewsQuerySchema = z.object({
  body: z.any().optional(),
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    pageSize: z.string().regex(/^\d+$/).optional(),
  }),
  params: z.object({ id: z.string().uuid() }),
});
