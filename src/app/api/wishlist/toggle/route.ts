// app/api/wishlist/toggle/route.ts - Enhanced version
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
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

    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const wishlist: Array<string> = user.wishlist || [];
    const isInWishlist = wishlist.some((id: string) => id.toString() === productId);

    if (isInWishlist) {
      // Remove from wishlist
      user.wishlist = wishlist.filter(id => id.toString() !== productId);
    } else {
      // Add to wishlist
      user.wishlist = [...wishlist, productId];
    }

    await user.save();

    return NextResponse.json({
      message: isInWishlist ? 'Removed from wishlist' : 'Added to wishlist',
      inWishlist: !isInWishlist,
      wishlistCount: user.wishlist.length
    });

  } catch (error: any) {
    console.error('Error toggling wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to update wishlist' },
      { status: 500 }
    );
  }
}
