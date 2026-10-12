// components/admin/AdminProductsClient.tsx - Handle client-side updates
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Pencil } from 'lucide-react';
import Link from 'next/link';
import ProductDeleteButton from './ProductDeleteButton';

interface AdminProductsClientProps {
  initialProducts: any[];
}

export default function AdminProductsClient({ initialProducts }: AdminProductsClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const refreshProducts = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error refreshing products:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteSuccess = (deletedProductId: string) => {
    // Remove the deleted product from local state immediately
    setProducts(prev => prev.filter(product => product._id !== deletedProductId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshProducts}
            disabled={isRefreshing}
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Link href="/admin/products/create">
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Products Grid */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <CardTitle>All Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product._id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Product Image */}
                      <div className="relative">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-32 object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                        
                        <Badge 
                          className={`absolute top-2 right-2 ${
                            product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      {/* Product Info */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                          <span className="text-sm text-gray-500">Qty: {product.quantity}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <Link href={`/products/${product._id}`} target="_blank">
                          <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        
                        <div className="flex space-x-2">
                          <Link href={`/admin/products/${product._id}/edit`}>
                            <Button size="sm" variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          <ProductDeleteButton 
                            productId={product._id} 
                            productName={product.name}
                            onDeleteSuccess={() => handleDeleteSuccess(product._id)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first product</p>
              <Link href="/admin/products/create">
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Product
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
