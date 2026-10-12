// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * Comprehensive middleware to protect routes and handle authentication
 * Supports role-based access control and secure route protection
 */
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin routes protection - Strict admin-only access
    if (pathname.startsWith('/admin')) {
      if (!token || token.role !== 'admin') {
        const signInUrl = new URL('/auth/signin', req.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        signInUrl.searchParams.set('error', 'AdminAccessRequired');
        return NextResponse.redirect(signInUrl);
      }
    }

    // User dashboard and profile protection
    if (pathname.startsWith('/profile')) {
      if (!token) {
        const signInUrl = new URL('/auth/signin', req.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }
    }

    // Shopping cart and checkout protection
    if (pathname.startsWith('/cart') || pathname.startsWith('/checkout')) {
      if (!token) {
        const signInUrl = new URL('/auth/signin', req.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        signInUrl.searchParams.set('message', 'Please sign in to access your cart');
        return NextResponse.redirect(signInUrl);
      }
    }

    // Orders and purchase history protection
    if (pathname.startsWith('/orders') || pathname.startsWith('/my-orders')) {
      if (!token) {
        const signInUrl = new URL('/auth/signin', req.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }
    }

    // API routes protection (except auth routes)
    if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
      // Protect admin API routes
      if (pathname.startsWith('/api/admin')) {
        if (!token || token.role !== 'admin') {
          return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          );
        }
      }

      // Protect user-specific API routes
      if (
        pathname.startsWith('/api/cart') ||
        pathname.startsWith('/api/orders') ||
        pathname.startsWith('/api/profile')
      ) {
        if (!token) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }
      }
    }

    // Add security headers
    const response = NextResponse.next();
    
    // Security headers for all routes
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Additional security for admin routes
    if (pathname.startsWith('/admin')) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Always allow public routes
        const publicRoutes = [
          '/auth',
          '/api/auth',
          '/',
          '/products',
          '/about',
          '/contact',
          '/terms',
          '/privacy',
          '/help',
          '/_next',
          '/favicon',
          '/robots.txt',
          '/sitemap.xml'
        ];

        // Check if current path is a public route
        const isPublicRoute = publicRoutes.some(route => 
          pathname === route || pathname.startsWith(route + '/')
        );

        if (isPublicRoute) {
          return true;
        }

        // Admin routes require admin role
        if (pathname.startsWith('/admin')) {
          return token?.role === 'admin';
        }

        // API admin routes require admin role
        if (pathname.startsWith('/api/admin')) {
          return token?.role === 'admin';
        }

        // Protected API routes require authentication
        if (
          pathname.startsWith('/api/cart') ||
          pathname.startsWith('/api/orders') ||
          pathname.startsWith('/api/profile') ||
          pathname.startsWith('/api/users')
        ) {
          return !!token;
        }

        // Protected user routes require authentication
        if (
          pathname.startsWith('/profile') ||
          pathname.startsWith('/cart') ||
          pathname.startsWith('/checkout') ||
          pathname.startsWith('/orders') ||
          pathname.startsWith('/my-orders')
        ) {
          return !!token;
        }

        // Allow all other routes by default
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};
