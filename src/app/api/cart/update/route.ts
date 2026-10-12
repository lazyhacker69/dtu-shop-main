// app/api/cart/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { z } from 'zod';

const updateCartSchema = z.object({
  itemId: z.string(),
  quantity: z.number().min(1).max(10)
});

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateCartSchema.parse(body);
    
    // if (!itemId || !quantity || quantity < 1) {
    //   return NextResponse.json(
    //     { error: 'Invalid item ID or quantity' },
    //     { status: 400 }
    //   );
    // }

    await dbConnect();

    const cart = await Cart.findOne({ user: session.user.id });
    
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    const itemIndex = cart.items.findIndex((item: any) => 
      item._id.toString() === validatedData.itemId
    );

    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    const product = await Product.findById(cart.items[itemIndex].product);

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'Product is no longer available' },
        { status: 400 }
      );
    }

    if (product.quantity < validatedData.quantity) {
      return NextResponse.json(
        { error: `Only ${product.quantity} units available` },
        { status: 400 }
      );
    }

    cart.items[itemIndex].quantity = validatedData.quantity;
    cart.totalAmount = cart.items.reduce((total: number, item: any) => {
      return total + (item.price * item.quantity);
    }, 0);
    await cart.save();

    return NextResponse.json({
      message: 'Cart updated successfully',
      cart: {
        itemCount: cart.items.length,
        totalAmount: cart.totalAmount
      }
    });


  } catch (error: any) {
    console.error('Error updating cart:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}
