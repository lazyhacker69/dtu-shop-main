// schemas/category.ts
import { z } from 'zod';

export const categoryCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(50, 'Category name cannot exceed 50 characters')
    .trim(),
  image: z.string().url('Please provide a valid image URL').optional(), // Keep this optional
  isActive: z.boolean(), // Remove .default(true) and .optional()
  sortOrder: z.number().int().min(0), // Remove .default(0) and .optional()
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

// Type inference
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
