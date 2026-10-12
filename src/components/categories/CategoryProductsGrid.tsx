// components/categories/CategoryProductsGrid.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Heart } from 'lucide-react';

interface CategoryProductsGridProps {
  products: any[];
  total: number;
  currentPage: number;
  totalPages: number;
  categorySlug: string;
  currentParams: any;
}

export default function CategoryProductsGrid({ 
  products, 
  total, 
  currentPage, 
  totalPages, 
  categorySlug,
  currentParams 
}: CategoryProductsGridProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const calculateDiscount = (price: number, comparePrice: number) => {
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(currentParams).forEach(([key, value]) => {
      if (value && key !== 'page') params.set(key, value as string);
    });
    if (page > 1) params.set('page', page.toString());
    return `/categories/${categorySlug}?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product._id} className="group hover:shadow-lg transition-all duration-300">
              <div className="relative overflow-hidden rounded-t-lg">
                <Link href={`/products/${product._id}`}>
                  <img
                    src={product.images[0] || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.comparePrice && (
                    <Badge className="bg-red-500">
                      {calculateDiscount(product.price, product.comparePrice)}% OFF
                    </Badge>
                  )}
                  {product.isFeatured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                </div>
                
                {/* Wishlist Button */}
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-3 right-3 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              
              <CardContent className="p-4">
                <Link href={`/products/${product._id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                {product.shortDescription && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.shortDescription}
                  </p>
                )}
                
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.comparePrice && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        {formatPrice(product.comparePrice)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">4.5</span>
                  </div>
                </div>
                
                <Button className="w-full" size="sm">
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4a1 1 0 00-1-1H9a1 1 0 00-1 1v1" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filter criteria</p>
          <Link href={`/categories/${categorySlug}`}>
            <Button variant="outline">Clear Filters</Button>
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-8">
          {currentPage > 1 && (
            <Link href={buildPageUrl(currentPage - 1)}>
              <Button variant="outline">Previous</Button>
            </Link>
          )}
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            return (
              <Link key={pageNum} href={buildPageUrl(pageNum)}>
                <Button 
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                >
                  {pageNum}
                </Button>
              </Link>
            );
          })}
          
          {currentPage < totalPages && (
            <Link href={buildPageUrl(currentPage + 1)}>
              <Button variant="outline">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
