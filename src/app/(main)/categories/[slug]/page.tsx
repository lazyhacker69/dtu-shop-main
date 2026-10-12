// app/categories/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Heart } from 'lucide-react';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import Product from '@/models/Product';
import CategoryFilters from '@/components/categories/CategoryFilters';
import CategoryProductsGrid from '@/components/categories/CategoryProductsGrid';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  await dbConnect();

  const { slug } = await params;
  const searchParams_ = await searchParams;
  
  const minPrice = searchParams_.minPrice;
  const maxPrice = searchParams_.maxPrice;
  const sort = searchParams_.sort || 'newest';
  const page = parseInt(searchParams_.page || '1');
  const limit = 12;

  // Find category by slug
  const categoryData = await Category.findOne<{ slug: string; _id: unknown; name: string; image?: string }>({ 
    slug, 
    isActive: true 
  }).lean();

  if (!categoryData) {
    notFound();
  }

  const category = {
    _id: (categoryData._id as string).toString(),
    name: categoryData.name,
    slug: categoryData.slug,
    image: categoryData.image
  };

  // Build query for products
  const query: any = { 
    category: categoryData._id,
    isActive: true 
  };

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // Build sort
  let sortQuery: any = {};
  switch (sort) {
    case 'price-asc':
      sortQuery = { price: 1 };
      break;
    case 'price-desc':
      sortQuery = { price: -1 };
      break;
    case 'name-asc':
      sortQuery = { name: 1 };
      break;
    case 'name-desc':
      sortQuery = { name: -1 };
      break;
    case 'newest':
    default:
      sortQuery = { createdAt: -1 };
      break;
  }

  const skip = (page - 1) * limit;

  // Fetch products and total count
  const [productsRaw, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query)
  ]);

  // Convert ObjectIds to strings
  const products = productsRaw.map((product: any) => ({
    _id: product._id.toString(),
    name: product.name,
    price: product.price,
    comparePrice: product.comparePrice,
    images: product.images,
    shortDescription: product.shortDescription,
    quantity: product.quantity,
    isFeatured: product.isFeatured,
    tags: product.tags,
    category: {
      _id: product.category._id.toString(),
      name: product.category.name
    }
  }));

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-blue-600">Categories</Link>
          <span>/</span>
          <span className="text-gray-900">{category.name}</span>
        </div>

        {/* Back Button */}
        <Link href="/categories" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Categories
        </Link>

        {/* Category Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Category Image */}
            <div className="flex-shrink-0">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {category.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Category Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {category.name}
              </h1>
              <p className="text-gray-600 mb-4">
                Discover amazing {category.name.toLowerCase()} products from your fellow students
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-blue-600">{total}</span>
                  <span className="text-gray-600">Products Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-gray-600">4.5 Average Rating</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline">
                <Heart className="w-4 h-4 mr-2" />
                Follow Category
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mb-8">
          <CategoryFilters
            currentFilters={{
              minPrice,
              maxPrice,
              sort
            }}
            totalResults={total}
            categorySlug={category.slug}
          />
        </div>

        {/* Products Grid */}
        <Suspense fallback={<CategoryProductsGridSkeleton />}>
          <CategoryProductsGrid
            products={products}
            total={total}
            currentPage={page}
            totalPages={totalPages}
            categorySlug={category.slug}
            currentParams={searchParams_}
          />
        </Suspense>
      </div>
    </div>
  );
}

// Loading skeleton
function CategoryProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-t-lg"></div>
          <CardContent className="p-4">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
