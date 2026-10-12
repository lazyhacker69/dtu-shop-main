// app/access-denied/page.tsx - Add "use client" directive
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <CardContent className="p-8">
            {/* Error Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <ShieldX className="w-10 h-10 text-red-600" />
            </div>
            
            {/* Error Code */}
            <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
            
            {/* Error Message */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-8">
              You don't have permission to access this page.
            </p>
            
            {/* Action Buttons */}
            <div className="space-y-4">
              <Link href="/">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  <Home className="mr-2 h-4 w-4" />
                  Go Back Home
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full border-red-600 text-red-600 hover:bg-red-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
