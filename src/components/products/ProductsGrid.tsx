// components/products/ProductsGrid.tsx - With working buttons
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Heart, ShoppingCart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductsGridProps {
  products: any[];
  total: number;
  currentPage: number;
  totalPages: number;
  currentParams: any;
}

export default function ProductsGrid({ 
  products, 
  total, 
  currentPage, 
  totalPages, 
  currentParams 
}: ProductsGridProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());

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
    return `/products?${params.toString()}`;
  };

  const handleAddToCart = async (productId: string, productName: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setLoadingStates(prev => ({ ...prev, [`cart-${productId}`]: true }));

    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity: 1
        }),
      });

      if (response.ok) {
        toast.success(`${productName} added to cart!`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add to cart');
      }
    } catch (error) {
      toast.error('An error occurred while adding to cart');
    } finally {
      setLoadingStates(prev => ({ ...prev, [`cart-${productId}`]: false }));
    }
  };

  const handleWishlistToggle = async (productId: string, productName: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to manage wishlist');
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setLoadingStates(prev => ({ ...prev, [`wishlist-${productId}`]: true }));

    try {
      const isInWishlist = wishlistItems.has(productId);
      const response = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        if (isInWishlist) {
          setWishlistItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
          toast.success(`${productName} removed from wishlist`);
        } else {
          setWishlistItems(prev => new Set(prev).add(productId));
          toast.success(`${productName} added to wishlist!`);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update wishlist');
      }
    } catch (error) {
      toast.error('An error occurred while updating wishlist');
    } finally {
      setLoadingStates(prev => ({ ...prev, [`wishlist-${productId}`]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing {products.length} of {total} products
        </p>
        <div className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product._id} className="group hover:shadow-lg transition-all duration-300">
              <div className="relative overflow-hidden">
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
                    <Badge className="bg-red-600 hover:bg-red-700">
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
                  className={`absolute top-3 right-3 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all ${
                    wishlistItems.has(product._id) ? 'bg-red-100 text-red-600' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleWishlistToggle(product._id, product.name);
                  }}
                  disabled={loadingStates[`wishlist-${product._id}`]}
                >
                  {loadingStates[`wishlist-${product._id}`] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart 
                      className={`h-4 w-4 ${
                        wishlistItems.has(product._id) ? 'fill-current' : ''
                      }`} 
                    />
                  )}
                </Button>
              </div>
              
              <CardContent className="p-4">
                <Badge variant="outline" className="mb-2 text-xs">
                  {product.category.name}
                </Badge>
                
                <Link href={`/products/${product._id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
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
                
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700" 
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart(product._id, product.name);
                  }}
                  disabled={loadingStates[`cart-${product._id}`]}
                >
                  {loadingStates[`cart-${product._id}`] ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2-2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4a1 1 0 00-1-1H9a1 1 0 00-1 1v1" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
          <Link href="/products">
            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
              Clear Filters
            </Button>
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-8">
          {currentPage > 1 && (
            <Link href={buildPageUrl(currentPage - 1)}>
              <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                Previous
              </Button>
            </Link>
          )}
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            return (
              <Link key={pageNum} href={buildPageUrl(pageNum)}>
                <Button 
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  className={pageNum === currentPage ? "bg-red-600 hover:bg-red-700" : "border-red-600 text-red-600 hover:bg-red-50"}
                >
                  {pageNum}
                </Button>
              </Link>
            );
          })}
          
          {currentPage < totalPages && (
            <Link href={buildPageUrl(currentPage + 1)}>
              <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                Next
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
