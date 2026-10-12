// app/api/cart/add/route.ts - Updated with ObjectId handling
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import Cart from '@/models/Cart';
import Product from '@/models/Product';

const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1).max(10),
  selectedVariants: z.array(z.object({
    type: z.string(),
    value: z.string(),
    price: z.number().default(0)
  })).optional()
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = addToCartSchema.parse(body);

    await dbConnect();

    // Verify product exists and is active
    const product = await Product.findById(validatedData.productId);
    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      );
    }

    // Check stock availability
    if (product.quantity < validatedData.quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Calculate variant price
    const variantPrice = validatedData.selectedVariants?.reduce((sum, variant) => sum + variant.price, 0) || 0;
    const itemPrice = product.price + variantPrice;

    // Find or create cart
    let cart = await Cart.findOne({ user: session.user.id });
    
    if (!cart) {
      cart = new Cart({
        user: session.user.id,
        items: [],
        totalAmount: 0
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex((item: any) => 
      item.product.toString() === validatedData.productId &&
      JSON.stringify(item.selectedVariants || []) === JSON.stringify(validatedData.selectedVariants || [])
    );

    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += validatedData.quantity;
      
      // Check if new quantity exceeds stock
      if (cart.items[existingItemIndex].quantity > product.quantity) {
        return NextResponse.json(
          { error: 'Cannot add more items than available stock' },
          { status: 400 }
        );
      }
    } else {
      // Add new item
      cart.items.push({
        product: validatedData.productId,
        quantity: validatedData.quantity,
        price: itemPrice,
        selectedVariants: validatedData.selectedVariants || []
      });
    }

    // Recalculate total
    cart.totalAmount = cart.items.reduce((total: number, item: any) => {
      return total + (item.price * item.quantity);
    }, 0);

    await cart.save();

    return NextResponse.json({
      message: 'Product added to cart successfully',
      cart: {
        itemCount: cart.items.length,
        totalAmount: cart.totalAmount
      }
    });

  } catch (error: any) {
    console.error('Error adding to cart:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to add product to cart' },
      { status: 500 }
    );
  }
}
