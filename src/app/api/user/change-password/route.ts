// app/api/user/change-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { comparePassword, hashPassword } from '@/lib/auth/password';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
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
    const validatedData = changePasswordSchema.parse(body);

    // Get user with password
    const user = await User.findById(session.user.id).select('+password');
    
    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'User not found or uses social login' },
        { status: 400 }
      );
    }

    // Verify current password
    const isValidPassword = await comparePassword(
      validatedData.currentPassword,
      user.password
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(validatedData.newPassword);

    // Update password
    await User.findByIdAndUpdate(session.user.id, {
      password: hashedNewPassword,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      message: 'Password updated successfully'
    });

  } catch (error: any) {
    console.error('Password change error:', error);
    
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
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
