// lib/auth.ts (or lib/authOptions.ts)
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { comparePassword } from '@/lib/auth/password';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await dbConnect();
          
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase() 
          }).select('+password');

          if (!user || !user.password) {
            return null;
          }

          const isValidPassword = await comparePassword(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            return null;
          }

          if (!user.isActive) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as 'student' | 'admin';
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await dbConnect();
          
          const existingUser = await User.findOne({ 
            email: user.email?.toLowerCase() 
          });

          if (!existingUser) {
            await User.create({
              email: user.email?.toLowerCase(),
              name: user.name,
              image: user.image,
              role: 'student',
              isActive: true,
            });
          }
          
          return true;
        } catch (error) {
          console.error('Sign in error:', error);
          return false;
        }
      }
      
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
