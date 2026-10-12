// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { categoryUpdateSchema } from '@/schemas/category';
import Category from '@/models/Category';
import dbConnect from '@/lib/dbConnect';
import { checkAdminAuth } from '@/lib/auth/apiAuth';
import mongoose from 'mongoose';

/**
 * GET /api/categories/[id] - Get single category
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }
    
    const category = await Category.findById(id).lean();
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ category });
    
  } catch (error: any) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/categories/[id] - Update category (Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    await checkAdminAuth();
    
    const { id } = await params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = categoryUpdateSchema.parse(body);
    
    await dbConnect();
    
    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // If name is being updated, check for duplicates
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const duplicateCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${validatedData.name}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (duplicateCategory) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 400 }
        );
      }
      
      // Update slug if name changed
    //   const newSlug = validatedData.name
    //     .toLowerCase()
    //     .replace(/[^a-z0-9]+/g, '-')
    //     .replace(/(^-|-$)/g, '');
      
    //   validatedData.slug = newSlug;
    }
    
    // Update category
    const category = await Category.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      message: 'Category updated successfully',
      category
    });
    
  } catch (error: any) {
    console.error('Error updating category:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
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
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id] - Delete category (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    await checkAdminAuth();
    
    const { id } = await params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Soft delete by setting isActive to false
    await Category.findByIdAndUpdate(id, { isActive: false });
    
    return NextResponse.json({
      message: 'Category deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Error deleting category:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
