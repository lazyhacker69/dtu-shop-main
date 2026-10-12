// lib/auth/utils.ts
import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Get current user session on server side
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

/**
 * Require authentication - redirect if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/signin');
  }
  
  return user;
}

/**
 * Require admin role - redirect if not admin
 */
export async function requireAdmin() {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    redirect('/unauthorized');
  }
  
  return user;
}

/**
 * Check if user has specific role
 */
export async function hasRole(requiredRole: 'student' | 'admin'): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === requiredRole || false;
}
