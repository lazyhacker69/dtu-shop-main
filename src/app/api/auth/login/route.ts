// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { signInSchema } from '@/schemas/auth';
import User from '@/models/User';
import { comparePassword } from '@/lib/auth/password';
import dbConnect from '@/lib/dbConnect';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = signInSchema.parse(body);
    
    await dbConnect();
    
    // Find user
    const user = await User.findOne({ 
      email: validatedData.email.toLowerCase() 
    }).select('+password');

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { error: 'This account uses social login' },
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

    // Create JWT token for API testing
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '24h' }
    );

    // Return success response
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        collegeId: user.collegeId,
        department: user.department,
        year: user.year
      },
      token // For API testing
    });

  } catch (error: any) {
    console.error('Login error:', error);
    
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
