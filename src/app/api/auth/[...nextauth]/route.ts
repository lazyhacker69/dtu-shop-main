// import NextAuth, { AuthOptions } from 'next-auth';
// import GoogleProvider from 'next-auth/providers/google';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import { MongoDBAdapter } from '@auth/mongodb-adapter';
// import { MongoClient } from 'mongodb';
// import User from '@/models/User';
// import { comparePassword } from '@/lib/auth/password';
// import { signInSchema } from '@/schemas/auth';
// import dbConnect from '@/lib/dbConnect';

// const client = new MongoClient(process.env.MONGODB_URI!);
// const clientPromise = client.connect();

// export const authOptions: AuthOptions = {

//   adapter: MongoDBAdapter(clientPromise) as unknown as import('next-auth/adapters').Adapter,
  
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       profile(profile) {
//         return {
//           id: profile.sub,
//           name: profile.name,
//           email: profile.email,
//           image: profile.picture,
//           role: 'student',
//         };
//       },
//     }),

//     CredentialsProvider({
//       id: 'credentials',
//       name: 'Email and Password',
//       credentials: {
//         email: {
//           label: 'Email',
//           type: 'email',
//           placeholder: 'your.email@college.edu',
//         },
//         password: {
//           label: 'Password',
//           type: 'password',
//           placeholder: 'Your password',
//         },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error('Email and password are required');
//         }

//         try {
//           // Validate input using Zod schema
//           const validatedCredentials = signInSchema.parse(credentials);
          
//           // Connect to database
//           await dbConnect();
          
//           // Find user by email
//           const user = await User.findOne({ 
//             email: validatedCredentials.email.toLowerCase() 
//           }).select('+password');

//           if (!user) {
//             throw new Error('No user found with this email');
//           }

//           if (!user.isActive) {
//             throw new Error('Account is deactivated. Please contact support.');
//           }

//           if (user.password) {
//             const isValidPassword = await comparePassword(
//               validatedCredentials.password,
//               user.password
//             );

//             if (!isValidPassword) {
//               throw new Error('Invalid password');
//             }
//           } else {
//             throw new Error('This account uses social login. Please sign in with Google.');
//           }

//           // Return user object for session
//           return {
//             id: user._id.toString(),
//             email: user.email,
//             name: user.name,
//             role: user.role,
//             image: user.image,
//             collegeId: user.collegeId,
//             department: user.department,
//             year: user.year,
//           };
//         } catch (error: any) {
//           console.error('Authentication error:', error.message);
//           throw new Error(error.message || 'Authentication failed');
//         }
//       },
//     }),
//   ],

//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },

//   jwt: {
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },

//   callbacks: {
//     async jwt({ token, user, account }) {
//       if (user) {
//         token.role = user.role;
//         token.collegeId = user.collegeId;
//         token.department = user.department;
//         token.year = user.year;
        
//         if (account?.provider === 'google') {
//           await dbConnect();
          
//           const existingUser = await User.findOne({ email: user.email });
          
//           if (!existingUser) {
//             const newUser = await User.create({
//               name: user.name,
//               email: user.email,
//               image: user.image,
//               role: 'student',
//               isActive: true,
//             });
            
//             token.role = newUser.role;
//             token.id = newUser._id.toString();
//           } else {
//             if (existingUser.image !== user.image) {
//               await User.findByIdAndUpdate(existingUser._id, {
//                 image: user.image,
//               });
//             }
            
//             token.role = existingUser.role;
//             token.collegeId = existingUser.collegeId;
//             token.department = existingUser.department;
//             token.year = existingUser.year;
//           }
//         }
//       }
      
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.sub!;
//         session.user.role = token.role as "student" | "admin";
//         session.user.collegeId = token.collegeId as string;
//         session.user.department = token.department as string;
//         session.user.year = token.year as number;
//       }
      
//       return session;
//     },
//     async signIn({ user, account, profile }) {
//       return true;
//     },
//   },
//   pages: {
//     signIn: '/auth/signin',
//     // signUp: '/auth/signup',
//     error: '/auth/error',
//   },
//   events: {
//     async signIn({ user, account, profile, isNewUser }) {
//       console.log(`User signed in: ${user.email} via ${account?.provider}`);
//     },
//     async signOut({ session, token }) {
//       console.log(`User signed out: ${session?.user?.email}`);
//     },
//     async createUser({ user }) {
//       console.log(`New user created: ${user.email}`);
//     },
//   },

//   debug: process.env.NODE_ENV === 'development',
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };



// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };