// schemas/common.ts
import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
});

export const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

export const imageUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a valid image file' }),
  alt: z.string().max(100, 'Alt text cannot exceed 100 characters').optional(),
});

// Type inference
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ImageUploadInput = z.infer<typeof imageUploadSchema>;
