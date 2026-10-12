// app/api/user/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

const notificationSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  sms: z.boolean(),
  marketing: z.boolean(),
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
    const validatedData = notificationSchema.parse(body);

    // Update notification preferences
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        notificationPreferences: validatedData,
        updatedAt: new Date(),
      },
      { new: true, select: 'notificationPreferences' }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Notification preferences updated successfully',
      preferences: updatedUser.notificationPreferences
    });

  } catch (error: any) {
    console.error('Notification update error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}
