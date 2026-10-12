// lib/auth/adminAuth.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Updated import
import { redirect } from 'next/navigation';

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin');
  }
  
  if (!session || session.user.role !== 'admin') {
    redirect('/unauthorized');
  }
  
  if (!session) {
    throw new Error('Session is null');
  }
  return session.user;
}

export async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Authentication required');
  }
  
  if (!session || session.user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  
  return session.user;
}
