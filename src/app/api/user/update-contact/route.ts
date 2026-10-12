// app/api/user/update-contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

const updateContactSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
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
    const validatedData = updateContactSchema.parse(body);

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

    // Update contact information
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        email: validatedData.email,
        phone: validatedData.phone,
        updatedAt: new Date(),
      },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Contact information updated successfully',
      user: {
        email: updatedUser.email,
        phone: updatedUser.phone,
      }
    });

  } catch (error: any) {
    console.error('Contact update error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update contact information' },
      { status: 500 }
    );
  }
}
