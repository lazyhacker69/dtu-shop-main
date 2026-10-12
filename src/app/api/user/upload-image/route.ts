// app/api/user/upload-image/route.ts - Enhanced error handling
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

    // Check Cloudinary configuration
    const config = cloudinary.config();
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      console.error('Cloudinary configuration missing:', {
        cloud_name: !!config.cloud_name,
        api_key: !!config.api_key,
        api_secret: !!config.api_secret
      });
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 2MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert to Data URI
    const parser = new DatauriParser();
    const base64Image = parser.format(file.name.split('.').pop() || 'png', buffer);

    if (!base64Image.content) {
      return NextResponse.json(
        { error: 'Failed to process image' },
        { status: 400 }
      );
    }

    console.log('Uploading to Cloudinary with config:', {
      cloud_name: config.cloud_name,
      api_key: config.api_key?.substring(0, 6) + '...',
    });

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(
      base64Image.content,
      {
        folder: 'dtu-shop/profile-images',
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto' },
          { format: 'auto' }
        ]
      }
    );

    return NextResponse.json({
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id
    });

  } catch (error: any) {
    console.error('Image upload error:', error);
    
    // Handle specific Cloudinary errors
    if (error.http_code === 401) {
      return NextResponse.json(
        { error: 'Cloudinary authentication failed. Please check API credentials.' },
        { status: 500 }
      );
    }
    
    if (error.http_code === 400) {
      return NextResponse.json(
        { error: 'Invalid image data or format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
