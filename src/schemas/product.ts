// schemas/product.ts - Fixed with separate schemas
import { z } from 'zod';

export const productVariantSchema = z.object({
  type: z.string().min(1, 'Variant type is required'),
  value: z.string().min(1, 'Variant value is required'),
  price: z.number().min(0, 'Price cannot be negative').optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative').optional(),
});

// Schema for form validation (all required fields are required)
export const productCreateFormSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string(),
  price: z.number().min(0, 'Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()),
  variants: z.array(productVariantSchema),
  quantity: z.number().min(0, 'Quantity must be positive'),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  images: z.array(z.string()).optional(),
  comparePrice: z.number().optional(),
});

// Schema for API processing (with defaults)
export const productCreateSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().default(''),
  price: z.number().min(0, 'Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).default([]),
  variants: z.array(productVariantSchema).default([]),
  quantity: z.number().min(0, 'Quantity must be positive'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.array(z.string()).optional(),
  comparePrice: z.number().optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

// Types
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type ProductCreateFormInput = z.infer<typeof productCreateFormSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
