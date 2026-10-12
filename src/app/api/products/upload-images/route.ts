// app/api/products/upload-images/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';
import DatauriParser from 'datauri/parser';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 images allowed' },
        { status: 400 }
      );
    }

    const parser = new DatauriParser();
    const uploadPromises = files.map(async (file) => {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error(`${file.name} is not an image file`);
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit for products
        throw new Error(`${file.name} is too large (max 5MB)`);
      }

      // Convert to buffer and upload
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = parser.format(file.name.split('.').pop() || 'png', buffer);

      return cloudinary.uploader.upload(
        base64Image.content!,
        {
          folder: 'dtu-shop/product-images',
          resource_type: 'image',
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto' },
            { format: 'auto' }
          ]
        }
      );
    });

    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map(result => result.secure_url);

    return NextResponse.json({
      urls: imageUrls,
      public_ids: uploadResults.map(result => result.public_id)
    });

  } catch (error: any) {
    console.error('Product images upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload images' },
      { status: 500 }
    );
  }
}
