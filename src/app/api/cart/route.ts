// app/api/cart/route.ts - Updated with ObjectId serialization
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Cart from '@/models/Cart';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const cartData = await Cart.findOne({ user: session.user.id })
      .populate({
        path: 'items.product',
        select: 'name price images quantity category',
        populate: {
          path: 'category',
          select: 'name'
        }
      })
      .lean();

    if (!cartData) {
      return NextResponse.json({
        cart: { items: [], totalAmount: 0 }
      });
    }

    // Type assertion and ObjectId conversion
    const cart = cartData as any;

    // Convert ObjectIds to strings for Client Components
    const serializedCart = {
      _id: cart._id?.toString(),
      user: cart.user?.toString(),
      items: (cart.items || []).map((item: any) => ({
        _id: item._id?.toString(),
        product: {
          _id: item.product._id.toString(),
          name: item.product.name,
          price: item.product.price,
          images: item.product.images,
          quantity: item.product.quantity,
          category: {
            _id: item.product.category._id.toString(),
            name: item.product.category.name
          }
        },
        quantity: item.quantity,
        price: item.price,
        selectedVariants: (item.selectedVariants || []).map((variant: any) => ({
          type: variant.type,
          value: variant.value,
          price: variant.price || 0
        }))
      })),
      totalAmount: cart.totalAmount || 0,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    };

    return NextResponse.json({
      cart: serializedCart
    });

  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Clear the cart
    await Cart.findOneAndUpdate(
      { user: session.user.id },
      { 
        $set: { 
          items: [], 
          totalAmount: 0 
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({
      message: 'Cart cleared successfully',
      cart: { items: [], totalAmount: 0 }
    });

  } catch (error: any) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
