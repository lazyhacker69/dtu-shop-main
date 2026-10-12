// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { signUpSchema } from '@/schemas/auth';
import { hashPassword } from '@/lib/auth/password';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

/**
 * Handle user registration
 * Creates new user account with email/password authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input data using Zod schema
    const validatedData = signUpSchema.parse(body);
    
    // Connect to database
    await dbConnect();
    
    // Check if user already existslet
    const existingUser = await User.findOne({ 
      email: validatedData.email.toLowerCase() 
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);
    
    // Create new user
    const newUser = await User.create({
      name: validatedData.name,
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
      collegeId: validatedData.collegeId,
      department: validatedData.department,
      year: validatedData.year,
      role: 'student',
      isActive: true,
    });
    
    // Return success response (exclude password)
    const { password, ...userWithoutPassword } = newUser.toObject();
    
    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
