// components/products/AddToCartSection.tsx
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Loader2, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface Variant {
  type: string;
  value: string;
  price?: number;
  stock?: number;
}

interface AddToCartSectionProps {
  product: {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    variants: Variant[];
    images: string[];
  };
}

export default function AddToCartSection({ product }: AddToCartSectionProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  // Group variants by type
  const variantGroups = product.variants.reduce((acc: any, variant) => {
    if (!acc[variant.type]) acc[variant.type] = [];
    acc[variant.type].push(variant);
    return acc;
  }, {});

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= Math.min(10, product.quantity)) {
      setQuantity(newQuantity);
    }
  };

  const handleVariantSelect = (type: string, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const getSelectedVariantPrice = () => {
    return Object.entries(selectedVariants).reduce((total, [type, value]) => {
      const variant = product.variants.find(v => v.type === type && v.value === value);
      return total + (variant?.price || 0);
    }, 0);
  };

  const getTotalPrice = () => {
    return (product.price + getSelectedVariantPrice()) * quantity;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    const addToCartPromise = fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product._id,
        quantity,
        selectedVariants: selectedVariants
      }),
    });
  
    toast.promise(addToCartPromise, {
      loading: 'Adding to cart...',
      success: 'Product added to cart successfully!',
      error: 'Failed to add to cart',
    });

    // Check if all required variants are selected
    const requiredVariants = Object.keys(variantGroups);
    const missingVariants = requiredVariants.filter(type => !selectedVariants[type]);
    
    if (missingVariants.length > 0) {
      alert(`Please select: ${missingVariants.join(', ')}`);
      return;
    }

    setIsLoading(true);
    
    try {
      const selectedVariantDetails = Object.entries(selectedVariants).map(([type, value]) => {
        const variant = product.variants.find(v => v.type === type && v.value === value);
        return {
          type,
          value,
          price: variant?.price || 0
        };
      });

      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          quantity,
          selectedVariants: selectedVariantDetails
        }),
      });

      if (response.ok) {
        // Show success message
        alert('Product added to cart successfully!');
        // You can integrate with a toast notification here
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Variant Selection */}
      {Object.entries(variantGroups).map(([type, variants]: [string, any]) => (
        <div key={type}>
          <Label className="text-sm font-medium mb-3 block capitalize">
            {type}
          </Label>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant: Variant, index: number) => (
              <Button
                key={index}
                variant={selectedVariants[type] === variant.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleVariantSelect(type, variant.value)}
                className="min-w-12"
              >
                {variant.value}
                {variant.price && variant.price > 0 && (
                  <span className="ml-1 text-xs">
                    +{formatPrice(variant.price)}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      ))}

      {/* Quantity Selector */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Quantity:</span>
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="h-8 w-8 p-0"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <Input
              type="number"
              min="1"
              max={Math.min(10, product.quantity)}
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="w-16 h-8 text-center border-0 focus:ring-0"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= Math.min(10, product.quantity)}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Price Display */}
        {getSelectedVariantPrice() > 0 && (
          <div className="text-sm text-gray-600">
            Base price: {formatPrice(product.price)} + Variants: {formatPrice(getSelectedVariantPrice())} = {formatPrice(product.price + getSelectedVariantPrice())} each
          </div>
        )}
        
        <div className="text-lg font-bold text-gray-900">
          Total: {formatPrice(getTotalPrice())}
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={product.quantity === 0 || isLoading}
        size="lg"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Adding to Cart...
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </>
        )}
      </Button>

      {product.quantity === 0 && (
        <Button variant="outline" className="w-full">
          Notify When Available
        </Button>
      )}

      {!isAuthenticated && (
        <p className="text-sm text-gray-600 text-center">
          <button
            onClick={() => router.push('/auth/signin')}
            className="text-blue-600 hover:underline"
          >
            Sign in
          </button>
          {' '}to add items to your cart
        </p>
      )}
    </div>
  );
}
