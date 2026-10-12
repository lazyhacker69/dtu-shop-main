// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { productCreateSchema } from '@/schemas/product';
import Product from '@/models/Product';
import Category from '@/models/Category';
import dbConnect from '@/lib/dbConnect';
import { requireAdmin } from '@/lib/auth/adminAuth';
import { checkAdminAuth } from '@/lib/auth/apiAuth';

/**
 * GET /api/products - Get all products with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'newest';
    const featured = searchParams.get('featured');
    const active = searchParams.get('active');

    // Build query
    const query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    if (active !== 'false') {
      query.isActive = true;
    }

    // Build sort
    let sortQuery: any = {};
    switch (sort) {
      case 'price-asc':
        sortQuery = { price: 1 };
        break;
      case 'price-desc':
        sortQuery = { price: -1 };
        break;
      case 'name-asc':
        sortQuery = { name: 1 };
        break;
      case 'name-desc':
        sortQuery = { name: -1 };
        break;
      case 'newest':
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    // Execute queries
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products - Create new product (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    // await requireAdmin();
    await checkAdminAuth();
    
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = productCreateSchema.parse(body);
    
    await dbConnect();
    
    // Verify category exists
    const categoryExists = await Category.findById(validatedData.category);
    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 400 }
      );
    }
    
    // Create product
    const product = await Product.create(validatedData);
    
    // Populate category before returning
    await product.populate('category', 'name');
    
    return NextResponse.json({
      message: 'Product created successfully',
      product
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating product:', error);

    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Please sign in to access this endpoint' },
        { status: 401 }
      );
    }
    
    if (error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
