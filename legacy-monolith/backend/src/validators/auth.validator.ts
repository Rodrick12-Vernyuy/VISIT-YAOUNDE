import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(120),
    email: z.string().email(),
    password: z.string().min(8).max(128),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(120),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10).optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});
