// schemas/order.ts
import { z } from 'zod';

export const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(50, 'Name cannot exceed 50 characters'),
  street: z
    .string()
    .min(1, 'Street address is required')
    .max(100, 'Street address cannot exceed 100 characters'),
  city: z
    .string()
    .min(1, 'City is required')
    .max(50, 'City name cannot exceed 50 characters'),
  state: z
    .string()
    .min(1, 'State is required')
    .max(50, 'State name cannot exceed 50 characters'),
  zipCode: z
    .string()
    .regex(/^\d{6}$/, 'Please enter a valid 6-digit PIN code'),
  country: z.string().default('India'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number'),
});

export const orderCreateSchema = z.object({
  items: z
    .array(z.object({
      product: z.string().min(1, 'Product ID is required'),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      variant: z.object({
        type: z.string(),
        value: z.string(),
      }).optional(),
    }))
    .min(1, 'At least one item is required'),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['razorpay', 'cod'], {
    errorMap: () => ({ message: 'Please select a valid payment method' }),
  }),
//   notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export const orderUpdateSchema = z.object({
  orderStatus: z.enum([
    'pending',
    'confirmed', 
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ]),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.string().datetime().optional(),
//   notes: z.string().max(500).optional(),
});

export const orderSearchSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  sortBy: z.enum(['createdAt', 'totalAmount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type inference
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>;
export type OrderSearchInput = z.infer<typeof orderSearchSchema>;
