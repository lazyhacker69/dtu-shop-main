// app/global-error.tsx
"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              {/* Error Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              
              {/* Error Message */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Application Error
              </h1>
              <p className="text-gray-600 mb-8">
                A critical error occurred. Please try refreshing the page or contact support if the problem persists.
              </p>
              
              {/* Action Buttons */}
              <div className="space-y-4">
                <button 
                  onClick={reset}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </button>
                
                <a 
                  href="/"
                  className="w-full border border-red-600 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg flex items-center justify-center"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
