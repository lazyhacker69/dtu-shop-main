// app/categories/[slug]/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Package } from 'lucide-react';

export default function CategoryNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="text-xl font-semibold">Category Not Found</h2>
            <p className="text-gray-600">
              The category you're looking for doesn't exist or has been removed.
            </p>
            <div className="flex gap-2">
              <Link href="/categories">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  All Categories
                </Button>
              </Link>
              <Link href="/products">
                <Button>Browse Products</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
