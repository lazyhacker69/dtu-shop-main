// src/app/api/products/[id]/route.ts - Fixed version
import { NextRequest, NextResponse } from 'next/server';
import { productUpdateSchema } from '@/schemas/product';
import Product from '@/models/Product';
import Category from '@/models/Category';
import dbConnect from '@/lib/dbConnect';
import { checkAdminAuth } from '@/lib/auth/apiAuth';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/products/[id] - Get single product with proper serialization
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    const productData = await Product.findById(id)
      .populate('category', 'name slug')
      // .lean();
    
    if (!productData) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Serialize the product data properly
    const product = {
      _id: productData._id.toString(),
      name: productData.name,
      description: productData.description,
      shortDescription: productData.shortDescription || '',
      price: productData.price,
      comparePrice: productData.comparePrice || null,
      category: {
        _id: productData.category._id.toString(),
        name: productData.category.name,
        slug: productData.category.slug
      },
      quantity: productData.quantity,
      isActive: productData.isActive,
      isFeatured: productData.isFeatured || false,
      images: productData.images || [],
      tags: productData.tags || [],
      variants: productData.variants || [],
      createdAt: productData.createdAt,
      updatedAt: productData.updatedAt
    };
    
    return NextResponse.json({ product });
    
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/[id] - Update product with better error handling
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    await checkAdminAuth();
    
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    console.log('Update request body:', body); // Debug log
    
    await dbConnect();
    
    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Validate category exists if provided
    if (body.category) {
      const categoryExists = await Category.findById(body.category);
      if (!categoryExists) {
        return NextResponse.json(
          { error: 'Invalid category ID' },
          { status: 400 }
        );
      }
    }
    
    // Clean and validate the data
    const cleanedData = {
      name: body.name,
      description: body.description,
      shortDescription: body.shortDescription || '',
      price: Number(body.price),
      comparePrice: body.comparePrice ? Number(body.comparePrice) : null,
      category: body.category,
      quantity: Number(body.quantity),
      isActive: Boolean(body.isActive),
      isFeatured: Boolean(body.isFeatured),
      images: Array.isArray(body.images) ? body.images : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      variants: Array.isArray(body.variants) ? body.variants : []
    };
    
    console.log('Cleaned data:', cleanedData); // Debug log
    
    // Validate with Zod schema
    const validatedData = productUpdateSchema.parse(cleanedData);
    console.log('Validated data:', validatedData); // Debug log
    
    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...validatedData,
        updatedAt: new Date()
      },
      { 
        new: true, 
        runValidators: true,
        select: '-__v'
      }
    ).populate('category', 'name slug');
    
    if (!updatedProduct) {
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
    }
    
    console.log('Product updated successfully:', updatedProduct._id); // Debug log
    
    return NextResponse.json({
      message: 'Product updated successfully',
      product: {
        _id: updatedProduct._id.toString(),
        name: updatedProduct.name,
        description: updatedProduct.description,
        shortDescription: updatedProduct.shortDescription,
        price: updatedProduct.price,
        comparePrice: updatedProduct.comparePrice,
        category: {
          _id: updatedProduct.category._id.toString(),
          name: updatedProduct.category.name,
          slug: updatedProduct.category.slug
        },
        quantity: updatedProduct.quantity,
        isActive: updatedProduct.isActive,
        isFeatured: updatedProduct.isFeatured,
        images: updatedProduct.images,
        tags: updatedProduct.tags,
        variants: updatedProduct.variants,
        updatedAt: updatedProduct.updatedAt
      }
    });
    
  } catch (error: any) {
    console.error('Error updating product:', error);
    
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
      console.log('Zod validation errors:', error.errors); // Debug log
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
            received: err.received
          }))
        },
        { status: 400 }
      );
    }
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Database validation error', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id] - Delete product (unchanged)
 */
interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    await dbConnect();

    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Soft delete
    await Product.findByIdAndUpdate(id, { 
      isActive: false,
      updatedAt: new Date()
    });

    return NextResponse.json({
      message: 'Product deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}