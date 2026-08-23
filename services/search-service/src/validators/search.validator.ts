import { z } from 'zod';

export const searchQuerySchema = z.object({
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
