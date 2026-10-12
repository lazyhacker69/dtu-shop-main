// components/layout/ConditionalNavbar.tsx
"use client";

import { usePathname } from 'next/navigation';
import Footer from './Footer';


export default function ConditionalFooter() {
  const pathname = usePathname();
  

  const hiddenPaths = [
    '/auth/signin',
    '/auth/signup',
    '/admin'
  ];
  
  // Check if current path should hide navbar
  const shouldHideFooter = hiddenPaths.some(path => {
    if (path === '/admin') {
      // Hide navbar for all admin routes
      return pathname.startsWith('/admin');
    }
    // Exact match for auth routes
    return pathname === path;
  });
  
  // Don't render navbar if path is in hidden list
  if (shouldHideFooter) {
    return null;
  }
  
  return <Footer/>
}
