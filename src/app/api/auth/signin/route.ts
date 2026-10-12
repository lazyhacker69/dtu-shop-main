// app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { signInSchema } from '@/schemas/auth';
import { comparePassword } from '@/lib/auth/password';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

/**
 * Handle user sign-in with credentials
 * Validates credentials and returns user data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = signInSchema.parse(body);
    
    // Connect to database
    await dbConnect();
    
    // Find user by email
    const user = await User.findOne({ 
      email: validatedData.email.toLowerCase() 
    }).select('+password');

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user account is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { error: 'This account uses social login. Please sign in with Google.' },
        { status: 400 }
      );
    }

    const isValidPassword = await comparePassword(
      validatedData.password,
      user.password
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Return success (NextAuth will handle session creation)
    const { password, ...userWithoutPassword } = user.toObject();
    
    return NextResponse.json({
      message: 'Sign in successful',
      user: userWithoutPassword,
    });
    
  } catch (error: any) {
    console.error('Sign-in error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
