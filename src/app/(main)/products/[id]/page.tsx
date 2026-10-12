// app/products/[id]/page.tsx - Enhanced with working features and ObjectId fixes
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Heart, Share2, ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import RelatedProducts from '@/components/products/RelatedProducts';

import WishlistButton from '@/components/products/WishlistButton';
import ShareButton from '@/components/products/ShareButton';
import { FlattenMaps } from 'mongoose';
import AddToCartSection from '@/components/products/AddToCartButton';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

interface ProductData {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  tags: string[];
  variants: {
    _id?: string;
    type: string;
    value: string;
    price?: number;
    stock?: number;
  }[];
  quantity: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  await dbConnect();
  
  const { id } = await params;
  
  const productData = await Product.findById(id)
      .populate('category', 'name slug')
      .lean() as FlattenMaps<any> & Required<{ _id: unknown }> & { __v: number };

  if (!productData || !productData.isActive) {
    notFound();
  }

  // Convert all ObjectIds to strings for Client Components
  const product: ProductData = {
    _id: (productData._id as string).toString(),
    name: productData.name,
    description: productData.description,
    shortDescription: productData.shortDescription,
    price: productData.price,
    comparePrice: productData.comparePrice,
    images: productData.images,
    tags: productData.tags || [],
    quantity: productData.quantity,
    isActive: productData.isActive,
    isFeatured: productData.isFeatured,
    createdAt: productData.createdAt,
    updatedAt: productData.updatedAt,
    // Convert variants array with ObjectIds
    variants: (productData.variants || []).map((variant: any) => ({
      _id: variant._id?.toString() || '',
      type: variant.type,
      value: variant.value,
      price: variant.price || 0,
      stock: variant.stock || 0
    })),
    // Convert category ObjectId
    category: {
      _id: productData.category._id.toString(),
      name: productData.category.name,
      slug: productData.category.slug
    }
  };

  // Fetch related products and convert ObjectIds
  const relatedProductsRaw = await Product.find({
    category: productData.category._id,
    _id: { $ne: productData._id },
    isActive: true
  })
    .populate('category', 'name')
    .limit(4)
    .lean();

  const relatedProducts = relatedProductsRaw.map((relatedProduct: any) => ({
    _id: relatedProduct._id.toString(),
    name: relatedProduct.name,
    price: relatedProduct.price,
    comparePrice: relatedProduct.comparePrice,
    images: relatedProduct.images,
    category: {
      _id: relatedProduct.category._id.toString(),
      name: relatedProduct.category.name
    }
  }));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const calculateDiscount = (price: number, comparePrice: number) => {
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600">Products</Link>
          <span>/</span>
          <Link href={`/categories/${product.category.slug}`} className="hover:text-blue-600">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        {/* Back Button */}
        <Link href="/products" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div>
            <ProductImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-2">
                {product.category.name}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600">
                {product.shortDescription}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-gray-600">(4.5) • 24 reviews</span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                    <Badge className="bg-red-500">
                      {calculateDiscount(product.price, product.comparePrice)}% OFF
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-green-600 font-medium">
                You save {product.comparePrice ? formatPrice(product.comparePrice - product.price) : '₹0'}
              </p>
            </div>

            {/* Stock Status */}
            <div>
              {product.quantity > 0 ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">
                    In Stock ({product.quantity} available)
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Add to Cart Section with Variants */}
            <AddToCartSection
              product={{
                _id: product._id, // Now a string
                name: product.name,
                price: product.price,
                quantity: product.quantity,
                variants: product.variants, // Now all ObjectIds are strings
                images: product.images
              }}
            />

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <WishlistButton 
                productId={product._id} // Now a string
                productName={product.name}
              />
              <ShareButton 
                product={{
                  _id: product._id, // Now a string
                  name: product.name,
                  price: product.price,
                  images: product.images
                }}
              />
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="mb-12">
          <Tabs defaultValue="description" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews (24)</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="description" className="space-y-4">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="specifications" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Category</span>
                      <span>{product.category.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Condition</span>
                      <span>New</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Availability</span>
                      <span>{product.quantity > 0 ? 'In Stock' : 'Out of Stock'}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-gray-600">Reviews feature coming soon!</p>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </div>
    </div>
  );
}
