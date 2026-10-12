// app/admin/products/page.tsx
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { requireAdmin } from '@/lib/auth/adminAuth';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Link from 'next/link';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';
import ProductDeleteButton from '@/components/admin/ProductDeleteButton';


export default async function AdminProducts() {
  await requireAdmin();
  await dbConnect();

  const productsRaw = await Product.find({})
  .populate('category', 'name')
  .sort({ createdAt: -1 })
  .lean(); // Important: use .lean() to get plain objects

// Serialize the products data to remove Mongoose ObjectIds
const products = productsRaw.map((product: any) => ({
  _id: product._id.toString(), // Convert ObjectId to string
  name: product.name || '',
  description: product.description || '',
  price: product.price || 0,
  comparePrice: product.comparePrice || null,
  category: {
    _id: product.category?._id?.toString() || '',
    name: product.category?.name || ''
  },
  quantity: product.quantity || 0,
  isActive: product.isActive ?? true,
  isFeatured: product.isFeatured ?? false,
  images: product.images || [],
  createdAt: product.createdAt?.toString() || '',
  updatedAt: product.updatedAt?.toString() || ''
}));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  return (
    <AdminLayout title="Product Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Products</h2>
            <p className="text-gray-600">Manage your product catalog</p>
          </div>
          <Link href="/admin/products/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Products</CardTitle>
            <CardDescription>
              Total: {products.length} products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Product</th>
                    <th className="text-left p-3">Category</th> 
                    <th className="text-left p-3">Price</th>
                    <th className="text-left p-3">Stock</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Created</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => (
                    <tr key={product._id.toString()} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.shortDescription || product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {product.category?.name || 'No Category'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{formatPrice(product.price)}</div>
                        {product.comparePrice && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(product.comparePrice)}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{product.quantity}</div>
                        {product.quantity <= 5 && (
                          <Badge variant="destructive" className="text-xs">
                            Low Stock
                          </Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <Badge variant={product.isActive ? 'default' : 'secondary'}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {product.isFeatured && (
                            <Badge variant="outline" className="text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Link href={`/admin/products/${product._id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/products/${product._id}/edit`}>
                            <Button size="sm" variant="outline">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>

                          <ProductDeleteButton 
                            productId={product._id} 
                            productName={product.name} 
                          />

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
