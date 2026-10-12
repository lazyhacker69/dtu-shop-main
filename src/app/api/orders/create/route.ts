// app/api/orders/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';

const createOrderSchema = z.object({
  items: z.array(z.object({
    product: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    image: z.string(),
    selectedVariants: z.array(z.object({
      type: z.string(),
      value: z.string(),
      price: z.number()
    })).optional()
  })),
  subtotal: z.number(),
  tax: z.number(),
  shipping: z.number(),
  totalAmount: z.number(),
  shippingAddress: z.object({
    fullName: z.string(),
    phone: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    landmark: z.string().optional()
  }),
  paymentMethod: z.enum(['cash_on_delivery', 'upi', 'card', 'net_banking']),
  notes: z.string().optional()
});

function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DTU${timestamp.slice(-6)}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Verify product availability
    for (const item of validatedData.items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `Product ${item.name} is no longer available` },
          { status: 400 }
        );
      }
      
      if (product.quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.name}` },
          { status: 400 }
        );
      }
    }

    // Generate unique order number
    let orderNumber: string;
    let isUnique = false;
    let attempts = 0;

    // Create order with clean data structure
    const orderData = {
      user: session.user.id,
      items: validatedData.items.map(item => ({
        product: item.product, // This will be stored as ObjectId
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        selectedVariants: item.selectedVariants || []
      })),
      subtotal: validatedData.subtotal,
      tax: validatedData.tax,
      shipping: validatedData.shipping,
      totalAmount: validatedData.totalAmount,
      shippingAddress: validatedData.shippingAddress,
      paymentMethod: validatedData.paymentMethod,
      notes: validatedData.notes,
      status: 'pending',
      paymentStatus: validatedData.paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending'
    };
    
    do {
      orderNumber = generateOrderNumber();
      const existingOrder = await Order.findOne({ orderNumber });
      isUnique = !existingOrder;
      attempts++;
      
      if (attempts > 10) {
        throw new Error('Failed to generate unique order number');
      }
    } while (!isUnique);

    // Create order with explicit orderNumber
    const order = new Order({
      orderNumber, // Explicitly set the order number
      // user: session.user.id,
      // items: validatedData.items,
      // subtotal: validatedData.subtotal,
      // tax: validatedData.tax,
      // shipping: validatedData.shipping,
      // totalAmount: validatedData.totalAmount,
      // shippingAddress: validatedData.shippingAddress,
      // paymentMethod: validatedData.paymentMethod,
      // notes: validatedData.notes,
      // status: 'pending',
      // paymentStatus: validatedData.paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending'
      ...orderData,
    });

    console.log('Creating order with orderNumber:', orderNumber); // Debug log

    await order.save();

    // Update product quantities
    for (const item of validatedData.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { quantity: -item.quantity } }
      );
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: session.user.id },
      { $set: { items: [], totalAmount: 0 } }
    );

    return NextResponse.json({
      message: 'Order created successfully',
      order: {
        _id: order._id.toString(),
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status
      }
    });

  } catch (error: any) {
    console.error('Order creation error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid order data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
