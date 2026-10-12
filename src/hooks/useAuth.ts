// hooks/useAuth.ts - Enhanced with session update
"use client";

import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status, update } = useSession();

  const updateUserSession = async (userData: any) => {
    await update({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      collegeId: userData.collegeId,
      department: userData.department,
      year: userData.year,
      bio: userData.bio,
      image: userData.image,
    });
  };

  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading',
    isAdmin: session?.user?.role === 'admin',
    updateUserSession, // Add this method
  };
}
