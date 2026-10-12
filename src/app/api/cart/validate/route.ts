// app/api/cart/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Cart from '@/models/Cart';
import Product from '@/models/Product';

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

    const cart = await Cart.findOne({ user: session.user.id });
    
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate each item in cart
    const validationErrors = [];
    
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        validationErrors.push(`Product ${item.product} no longer exists`);
        continue;
      }
      
      if (!product.isActive) {
        validationErrors.push(`${product.name} is no longer available`);
        continue;
      }
      
      if (product.quantity < item.quantity) {
        validationErrors.push(`Only ${product.quantity} units of ${product.name} available`);
        continue;
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cart validation failed',
          details: validationErrors
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Cart is valid',
      itemCount: cart.items.length,
      totalAmount: cart.totalAmount
    });

  } catch (error: any) {
    console.error('Cart validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate cart' },
      { status: 500 }
    );
  }
}
