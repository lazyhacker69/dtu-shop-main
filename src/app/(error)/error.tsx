// app/error.tsx
"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw, Mail } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
    
    // Optional: Send error to analytics
    if (typeof window !== 'undefined') {
      // Track error in analytics
      try {
        // Example: gtag('event', 'exception', { description: error.message });
      } catch (e) {
        // Silently fail if analytics not available
      }
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <CardContent className="p-8">
            {/* Error Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            
            {/* Error Code */}
            <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
            
            {/* Error Message */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong!
            </h2>
            <p className="text-gray-600 mb-8">
              We're experiencing some technical difficulties. Our team has been notified and is working on a fix.
            </p>
            
            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                <p className="text-sm font-mono text-gray-800 break-all">
                  {error.message}
                </p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="space-y-4">
              <Button 
                onClick={reset}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              
              <Link href="/">
                <Button variant="outline" className="w-full border-red-600 text-red-600 hover:bg-red-50">
                  <Home className="mr-2 h-4 w-4" />
                  Go Back Home
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                onClick={() => window.location.reload()}
                className="w-full text-gray-600 hover:text-red-600"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Page
              </Button>
            </div>
            
            {/* Support Contact */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">
                If the problem persists, please contact support:
              </p>
              <a 
                href="mailto:support@dtushop.com"
                className="inline-flex items-center text-red-600 hover:underline text-sm"
              >
                <Mail className="mr-1 h-4 w-4" />
                support@dtushop.com
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
