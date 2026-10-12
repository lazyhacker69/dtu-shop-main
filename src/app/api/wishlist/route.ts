// app/api/wishlist/route.ts - With proper interfaces
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

interface WishlistItem {
  _id: any;
  name: string;
  price: number;
  comparePrice?: number;
  images: string[];
  shortDescription?: string;
  quantity: number;
  isActive: boolean;
  category: {
    _id: any;
    name: string;
  };
}

interface UserWithWishlist {
  _id: any;
  wishlist: WishlistItem[];
}

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

    const userData = await User.findById(session.user.id)
      .populate({
        path: 'wishlist',
        match: { isActive: true },
        select: 'name price comparePrice images shortDescription quantity category',
        populate: {
          path: 'category',
          select: 'name'
        }
      })
    //   .lean();

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Cast to our interface
    const user = userData as UserWithWishlist;

    // Convert ObjectIds to strings for client components
    const wishlist = (user.wishlist || []).map((item: WishlistItem) => ({
      _id: item._id.toString(),
      name: item.name,
      price: item.price,
      comparePrice: item.comparePrice,
      images: item.images,
      shortDescription: item.shortDescription,
      quantity: item.quantity,
      isActive: item.isActive,
      category: {
        _id: item.category._id.toString(),
        name: item.category.name
      }
    }));

    return NextResponse.json({
      wishlist
    });

  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}
