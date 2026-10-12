// app/api/products/featured/route.ts - Fixed TypeScript errors
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');

    const productsRaw = await Product.find({
      isActive: true,
      isFeatured: true,
      images: { $exists: true, $ne: [] } // Only products with images
    })
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

    // Type assertion to fix TypeScript error
    const products = productsRaw as any[];
    console.log(products + "here")

    // Serialize the products with proper error handling
    const serializedProducts = products.map(product => ({
      _id: product._id?.toString() || '',
      name: String(product.name || ''),
      images: Array.isArray(product.images) ? product.images : [],
      category: {
        name: String(product.category?.name || 'Uncategorized')
      },
      price: Number(product.price || 0)
    }));

    return NextResponse.json({ products: serializedProducts });

  } catch (error: any) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
}
