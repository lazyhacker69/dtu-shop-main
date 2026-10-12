// app/admin/products/[id]/page.tsx
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { requireAdmin } from '@/lib/auth/adminAuth';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';
import { notFound } from 'next/navigation';
import ProductDeleteButton from '@/components/admin/ProductDeleteButton';
// import ClientDate from '@/components/ui/ClientDate';

interface ProductViewPageProps {
  params: Promise<{ id: string }>; // Note: params is now a Promise
}

export default async function ProductViewPage({ params }: ProductViewPageProps) {
  await requireAdmin();
  await dbConnect();

  // Await params before accessing its properties
  const { id } = await params;

  const productData = await Product.findById(id)
    .populate('category', 'name')
    .lean() as any;

  if (!productData) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  return (
    <AdminLayout title="Product Details">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold">{productData.name}</h2>
              <p className="text-gray-600">Product Details</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href={`/admin/products/${productData._id.toString()}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </Button>
            </Link>
            <ProductDeleteButton 
              productId={productData._id.toString()} 
              productName={productData.name}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Images */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {productData.images?.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${productData.name} ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                {productData.shortDescription && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Short Description</h4>
                    <p className="text-gray-600">{productData.shortDescription}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Full Description</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{productData.description}</p>
                </div>
              </CardContent>
            </Card>

            {productData.variants && productData.variants.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Variants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {productData.variants.map((variant: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <span className="font-medium">{variant.type}: </span>
                          <span>{variant.value}</span>
                        </div>
                        <div className="text-right">
                          {variant.price && variant.price > 0 && (
                            <div className="text-sm text-gray-600">
                              +{formatPrice(variant.price)}
                            </div>
                          )}
                          {variant.stock !== undefined && (
                            <div className="text-sm text-gray-500">
                              Stock: {variant.stock}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Product Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {productData.category?.name || 'No Category'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Price</label>
                  <div className="mt-1">
                    <div className="text-2xl font-bold">{formatPrice(productData.price)}</div>
                    {productData.comparePrice && (
                      <div className="text-lg text-gray-500 line-through">
                        {formatPrice(productData.comparePrice)}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Stock Quantity</label>
                  <div className="mt-1">
                    <div className="text-xl font-semibold">{productData.quantity}</div>
                    {productData.quantity <= 5 && (
                      <Badge variant="destructive" className="text-xs mt-1">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1 space-y-2">
                    <Badge variant={productData.isActive ? 'default' : 'secondary'}>
                      {productData.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {productData.isFeatured && (
                      <Badge variant="outline">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>

                {productData.tags && productData.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tags</label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {productData.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <div className="mt-1 text-sm text-gray-600">
                  {<span suppressHydrationWarning className="text-gray-600">
                      {new Date(productData.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <div className="mt-1 text-sm text-gray-600">
                  <span suppressHydrationWarning className="text-gray-600">
                    {new Date(productData.updatedAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
