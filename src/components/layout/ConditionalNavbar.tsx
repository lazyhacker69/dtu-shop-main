// components/layout/ConditionalNavbar.tsx
"use client";

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Define paths where navbar should be hidden
  const hiddenPaths = [
    '/auth/signin',
    '/auth/signup',
    '/admin'
  ];
  
  // Check if current path should hide navbar
  const shouldHideNavbar = hiddenPaths.some(path => {
    if (path === '/admin') {
      // Hide navbar for all admin routes
      return pathname.startsWith('/admin');
    }
    // Exact match for auth routes
    return pathname === path;
  });
  
  // Don't render navbar if path is in hidden list
  if (shouldHideNavbar) {
    return null;
  }
  
  return <Navbar />;
}
