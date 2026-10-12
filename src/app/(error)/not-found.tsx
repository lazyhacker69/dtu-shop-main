// app/not-found.tsx - Add "use client" directive
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Search, ArrowLeft, Package } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <CardContent className="p-8">
            {/* Error Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <Package className="w-10 h-10 text-red-600" />
            </div>
            
            {/* Error Code */}
            <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
            
            {/* Error Message */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 mb-8">
              Sorry, we couldn't find the page you're looking for.
            </p>
            
            {/* Action Buttons */}
            <div className="space-y-4">
              <Link href="/">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  <Home className="mr-2 h-4 w-4" />
                  Go Back Home
                </Button>
              </Link>
              
              <Link href="/products">
                <Button variant="outline" className="w-full border-red-600 text-red-600 hover:bg-red-50">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Products
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="w-full text-gray-600 hover:text-red-600"
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
