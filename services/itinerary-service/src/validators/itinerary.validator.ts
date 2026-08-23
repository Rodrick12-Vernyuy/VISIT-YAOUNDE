import { z } from 'zod';

export const createItinerarySchema = z.object({
  body: z.object({
    title: z.string().min(2).max(160),
    description: z.string().max(2000).optional(),
    startDate: z.string().datetime().or(z.string().date()),
    endDate: z.string().datetime().or(z.string().date()),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const updateItinerarySchema = z.object({
  body: z.object({
    title: z.string().min(2).max(160).optional(),
    description: z.string().max(2000).optional(),
    startDate: z.string().datetime().or(z.string().date()).optional(),
    endDate: z.string().datetime().or(z.string().date()).optional(),
  }),
  query: z.any().optional(),
  params: z.object({ id: z.string().uuid() }),
});

export const addItemSchema = z.object({
  body: z.object({
    attractionId: z.string().uuid(),
    dayNumber: z.number().int().min(1),
    order: z.number().int().min(0),
    notes: z.string().max(1000).optional(),
  }),
  query: z.any().optional(),
  params: z.object({ id: z.string().uuid() }),
});

export const updateItemSchema = z.object({
  body: z.object({
    dayNumber: z.number().int().min(1).optional(),
    order: z.number().int().min(0).optional(),
    notes: z.string().max(1000).optional(),
  }),
  query: z.any().optional(),
  params: z.object({ id: z.string().uuid(), itemId: z.string().uuid() }),
});
