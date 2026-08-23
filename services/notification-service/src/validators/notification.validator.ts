import { z } from 'zod';

export const createNotificationSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    type: z.enum(['WELCOME', 'NEW_REVIEW', 'SYSTEM']),
    title: z.string().min(1).max(160),
    message: z.string().min(1).max(2000),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});
