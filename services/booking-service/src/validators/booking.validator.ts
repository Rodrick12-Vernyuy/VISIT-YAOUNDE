import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    attractionId: z.string().uuid(),
    visitDate: z.string().datetime().or(z.string().date()),
    numberOfPeople: z.number().int().min(1).max(50),
    notes: z.string().max(1000).optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const updateBookingSchema = z.object({
  body: z.object({
    visitDate: z.string().datetime().or(z.string().date()).optional(),
    numberOfPeople: z.number().int().min(1).max(50).optional(),
    notes: z.string().max(1000).optional(),
  }),
  query: z.any().optional(),
  params: z.object({ id: z.string().uuid() }),
});
