// src/components/admin/ProductDeleteButton.tsx - Enhanced with proper refresh
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductDeleteButtonProps {
  productId: string;
  productName: string;
  onDeleteSuccess?: () => void; // Add callback prop
}

export default function ProductDeleteButton({ 
  productId, 
  productName, 
  onDeleteSuccess 
}: ProductDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }

      toast.success('Product deleted successfully');
      
      // Call success callback if provided
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
      
      // Force router refresh to update the list
      router.refresh();
      
      // Alternative: Force a hard refresh if router.refresh() doesn't work
      // window.location.reload();
      
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(`Delete failed: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      size="sm" 
      variant="outline" 
      className="text-red-600 border-red-600 hover:bg-red-50"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
