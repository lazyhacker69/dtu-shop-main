// app/api/cart/remove/route.ts - Updated with ObjectId handling
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import Cart from '@/models/Cart';

const removeFromCartSchema = z.object({
  itemId: z.string()
});

// app/api/cart/remove/route.ts - Ensure DELETE method is exported
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemId } = body;

    await dbConnect();

    const cart = await Cart.findOne({ user: session.user.id });
    
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Remove item from cart
    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item: any) => 
      item._id.toString() !== itemId
    );

    if (cart.items.length === initialLength) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    // Recalculate total
    cart.totalAmount = cart.items.reduce((total: number, item: any) => {
      return total + (item.price * item.quantity);
    }, 0);

    await cart.save();

    return NextResponse.json({
      message: 'Item removed from cart successfully',
      cart: {
        itemCount: cart.items.length,
        totalAmount: cart.totalAmount
      }
    });

  } catch (error: any) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}

