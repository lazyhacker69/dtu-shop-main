// app/api/user/profile/route.ts - Fix the schema
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable(),
  collegeId: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  year: z.number().optional().nullable(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional().nullable(),
  image: z.string().optional().nullable(), // Allow null values
});

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    
    // Clean the data before validation - convert null to undefined
    const cleanedBody = {
      ...body,
      phone: body.phone || undefined,
      collegeId: body.collegeId || undefined,
      department: body.department || undefined,
      year: body.year || undefined,
      bio: body.bio || undefined,
      image: body.image || undefined, // Convert null to undefined
    };
    
    const validatedData = updateProfileSchema.parse(cleanedBody);

    // Check if email is being changed and if it's already taken
    if (validatedData.email !== session.user.email) {
      const existingUser = await User.findOne({ 
        email: validatedData.email,
        _id: { $ne: session.user.id }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 400 }
        );
      }
    }

    // Prepare update data, excluding undefined values
    const updateData: any = {
      name: validatedData.name,
      email: validatedData.email,
      updatedAt: new Date(),
    };

    // Only include fields that have values
    if (validatedData.phone) updateData.phone = validatedData.phone;
    if (validatedData.collegeId) updateData.collegeId = validatedData.collegeId;
    if (validatedData.department) updateData.department = validatedData.department;
    if (validatedData.year) updateData.year = validatedData.year;
    if (validatedData.bio) updateData.bio = validatedData.bio;
    if (validatedData.image) updateData.image = validatedData.image;

    // Update user profile
    const updatedUserData = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        select: '-password'
      }
    ).lean();

    if (!updatedUserData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Type assertion to fix TypeScript error
    const user = updatedUserData as any;

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        collegeId: user.collegeId || null,
        department: user.department || null,
        year: user.year || null,
        bio: user.bio || null,
        image: user.image || null,
        role: user.role,
      }
    });

  } catch (error: any) {
    console.error('Profile update error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// ... rest of the GET method remains the same
