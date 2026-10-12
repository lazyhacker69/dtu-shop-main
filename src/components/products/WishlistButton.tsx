// components/products/WishlistButton.tsx - Enhanced version
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface WishlistButtonProps {
  productId: string;
  productName: string;
  className?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export default function WishlistButton({ 
  productId, 
  productName, 
  className = "",
  size = "lg",
  variant = "outline"
}: WishlistButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Check if product is in wishlist on component mount
  useEffect(() => {
    if (isAuthenticated) {
      checkWishlistStatus();
    } else {
      setIsCheckingStatus(false);
    }
  }, [isAuthenticated, productId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        const isInList = data.wishlist.some((item: any) => item._id === productId);
        setIsInWishlist(isInList);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        const result = await response.json();
        setIsInWishlist(result.inWishlist);
        toast(`${productName} added to wishlist`);
        if (!result.inWishlist) {
          toast(`${productName} removed from wishlist`);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Error removing from wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleWishlistToggle}
      disabled={isLoading}
      className={`${isInWishlist ? 'text-red-600 border-red-600 hover:bg-red-50' : ''} ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : (
        <Heart className={`w-5 h-5 mr-2 ${isInWishlist ? 'fill-current' : ''}`} />
      )}
      {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
    </Button>
  );
}
