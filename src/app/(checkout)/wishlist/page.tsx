// app/wishlist/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  ArrowLeft, 
  Loader2,
  Star,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: string[];
  shortDescription?: string;
  quantity: number;
  isActive: boolean;
  category: {
    _id: string;
    name: string;
  };
}

export default function WishlistPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin?callbackUrl=/wishlist');
      return;
    }

    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.wishlist || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    setRemovingItems(prev => new Set(prev).add(productId));
    
    try {
      const response = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item._id !== productId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const addToCart = async (product: WishlistItem) => {
    setAddingToCart(prev => new Set(prev).add(product._id));
    
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1
        }),
      });

      if (response.ok) {
        // Show success message or redirect to cart
        toast('Product added to cart successfully!');
      } else {
        const error = await response.json();
        toast(error.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast('Failed to add to cart');
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(product._id);
        return newSet;
      });
    }
  };

  const shareProduct = (product: WishlistItem) => {
    const productUrl = `${window.location.origin}/products/${product._id}`;
    const shareText = `Check out ${product.name} for ₹${product.price} on CollegeMarket!`;
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: shareText,
        url: productUrl,
      });
    } else {
      navigator.clipboard.writeText(productUrl);
      alert('Product link copied to clipboard!');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const calculateDiscount = (price: number, comparePrice: number) => {
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600">
              {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved for later
            </p>
          </div>
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Save items you love to buy them later</p>
            <Link href="/products">
              <Button>
                Discover Products
              </Button>
            </Link>
          </div>
        ) : (
          /* Wishlist Items */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item._id} className="group hover:shadow-lg transition-all duration-300">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Link href={`/products/${item._id}`}>
                    <img
                      src={item.images[0] || '/placeholder-product.jpg'}
                      alt={item.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {item.comparePrice && (
                      <Badge className="bg-red-500">
                        {calculateDiscount(item.price, item.comparePrice)}% OFF
                      </Badge>
                    )}
                    {item.quantity === 0 && (
                      <Badge variant="secondary">Out of Stock</Badge>
                    )}
                  </div>
                  
                  {/* Remove from Wishlist */}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-3 right-3 h-8 w-8 p-0"
                    onClick={() => removeFromWishlist(item._id)}
                    disabled={removingItems.has(item._id)}
                  >
                    {removingItems.has(item._id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className="h-4 w-4 fill-current text-red-500" />
                    )}
                  </Button>
                </div>
                
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-2 text-xs">
                    {item.category.name}
                  </Badge>
                  
                  <Link href={`/products/${item._id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  
                  {item.shortDescription && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.shortDescription}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(item.price)}
                      </span>
                      {item.comparePrice && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {formatPrice(item.comparePrice)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">4.5</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => addToCart(item)}
                      disabled={item.quantity === 0 || addingToCart.has(item._id)}
                    >
                      {addingToCart.has(item._id) ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {item.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </>
                      )}
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => shareProduct(item)}
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => removeFromWishlist(item._id)}
                        disabled={removingItems.has(item._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Wishlist Actions */}
        {wishlistItems.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Ready to buy everything?
                </h3>
                <p className="text-gray-600">
                  Add all available items to your cart at once
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  Share Wishlist
                </Button>
                <Button
                  onClick={() => {
                    wishlistItems
                      .filter(item => item.quantity > 0)
                      .forEach(item => addToCart(item));
                  }}
                >
                  Add All to Cart
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
