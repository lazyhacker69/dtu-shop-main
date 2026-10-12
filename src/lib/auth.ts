// lib/auth.ts - Updated with session update support
import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import User from '@/models/User';
import { comparePassword } from '@/lib/auth/password';
import { signInSchema } from '@/schemas/auth';
import dbConnect from '@/lib/dbConnect';

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as unknown as import('next-auth/adapters').Adapter,
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'student',
        };
      },
    }),

    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'your.email@college.edu',
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Your password',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const validatedCredentials = signInSchema.parse(credentials);
          await dbConnect();
          
          const user = await User.findOne({ 
            email: validatedCredentials.email.toLowerCase() 
          }).select('+password');

          if (!user) {
            throw new Error('No user found with this email');
          }

          if (!user.isActive) {
            throw new Error('Account is deactivated. Please contact support.');
          }

          if (user.password) {
            const isValidPassword = await comparePassword(
              validatedCredentials.password,
              user.password
            );

            if (!isValidPassword) {
              throw new Error('Invalid password');
            }
          } else {
            throw new Error('This account uses social login. Please sign in with Google.');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
            collegeId: user.collegeId,
            department: user.department,
            year: user.year,
            phone: user.phone,
            bio: user.bio,
          };
        } catch (error: any) {
          console.error('Authentication error:', error.message);
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Handle initial sign in
      if (user) {
        token.role = user.role;
        token.collegeId = user.collegeId;
        token.department = user.department;
        token.phone = user.phone;
        token.year = user.year;
        
        if (account?.provider === 'google') {
          await dbConnect();
          
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            const newUser = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: 'student',
              isActive: true,
            });
            
            token.role = newUser.role;
            token.id = newUser._id.toString();
          } else {
            if (existingUser.image !== user.image) {
              await User.findByIdAndUpdate(existingUser._id, {
                image: user.image,
              });
            }
            
            token.role = existingUser.role;
            token.collegeId = existingUser.collegeId;
            token.department = existingUser.department;
            token.year = existingUser.year;
            token.phone = existingUser.phone;
            token.bio = existingUser.bio;
          }
        }
      }

      // Handle session updates from client
      if (trigger === "update" && session) {
        console.log('Updating session with:', session);
        
        // Update token with new session data
        if (session.name !== undefined) token.name = session.name;
        if (session.email !== undefined) token.email = session.email;
        if (session.phone !== undefined) token.phone = session.phone;
        if (session.collegeId !== undefined) token.collegeId = session.collegeId;
        if (session.department !== undefined) token.department = session.department;
        if (session.year !== undefined) token.year = session.year;
        if (session.bio !== undefined) token.bio = session.bio;
        if (session.image !== undefined) token.picture = session.image;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as "student" | "admin";
        session.user.collegeId = token.collegeId as string;
        session.user.department = token.department as string;
        session.user.year = token.year as number;
        session.user.phone = token.phone as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
      }
      
      return session;
    },
    
    async signIn({ user, account, profile }) {
      return true;
    },
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user.email} via ${account?.provider}`);
    },
    async signOut({ session, token }) {
      console.log(`User signed out: ${session?.user?.email}`);
    },
    async createUser({ user }) {
      console.log(`New user created: ${user.email}`);
    },
  },

  debug: process.env.NODE_ENV === 'development',
};
