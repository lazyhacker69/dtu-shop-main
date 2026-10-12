// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { categoryCreateSchema } from '@/schemas/category';
import Category from '@/models/Category';
import dbConnect from '@/lib/dbConnect';
import { requireAdmin } from '@/lib/auth/adminAuth';
import { checkAdminAuth } from '@/lib/auth/apiAuth';

/**
 * GET /api/categories - Get all categories
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    
    const query: any = {};
    if (active !== 'false') {
      query.isActive = true;
    }
    
    const categories = await Category.find(query)
      .sort({ sortOrder: 1, name: 1 })
      .lean();
    
    return NextResponse.json({ categories });
    
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories - Create new category (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    // await requireAdmin();

    await checkAdminAuth();
    
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = categoryCreateSchema.parse(body);
    
    await dbConnect();
    
    // Check if category name already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${validatedData.name}$`, 'i') }
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }
    
    // Generate slug from name for the model requirement
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Create category
    const category = await Category.create({
      ...validatedData,
      slug // Still needed for model compatibility
    });
    
    return NextResponse.json({
      message: 'Category created successfully',
      category
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating category:', error);

    // Handle authentication errors
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
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
