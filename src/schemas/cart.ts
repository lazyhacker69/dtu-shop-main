// schemas/cart.ts
import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(10, 'Maximum 10 items allowed per product'),
  variant: z.object({
    type: z.string(),
    value: z.string(),
  }).optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .max(10, 'Maximum 10 items allowed per product'),
});

export const removeFromCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

// Type inference
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;
