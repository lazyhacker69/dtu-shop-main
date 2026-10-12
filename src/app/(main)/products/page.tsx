// app/products/page.tsx - Updated layout with horizontal filters
import { Suspense } from 'react';
import ProductsGrid from '@/components/products/ProductsGrid';
import { Card, CardContent } from '@/components/ui/card';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category';
import ProductsSearch from '@/components/products/ProductSearch';
import ProductsFiltersBar from '@/components/products/ProductsFiltersBar';

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  await dbConnect();
  
  const params = await searchParams;
  const search = params.search || '';
  const category = params.category || '';
  const minPrice = params.minPrice;
  const maxPrice = params.maxPrice;
  const sort = params.sort || 'newest';
  const page = parseInt(params.page || '1');
  const limit = 12;

  // Build query
  const query: any = { isActive: true };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }
  
  if (category && category !== 'all') {
    query.category = category;
  }
  
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

  // Fetch data
  const [productsRaw, total, categoriesRaw] = await Promise.all([
    Product.find(query)
      .populate('category', 'name')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
    Category.find({ isActive: true }).sort({ name: 1 }).lean()
  ]);

  // Convert ObjectIds to strings for Client Components
  const products = productsRaw.map((product: any) => ({
    _id: product._id.toString(),
    name: product.name,
    price: product.price,
    comparePrice: product.comparePrice,
    images: product.images,
    shortDescription: product.shortDescription,
    description: product.description,
    quantity: product.quantity,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    tags: product.tags,
    category: {
      _id: product.category._id.toString(),
      name: product.category.name
    }
  }));

  const categories = categoriesRaw.map((category: any) => ({
    _id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    image: category.image,
    isActive: category.isActive,
    sortOrder: category.sortOrder
  }));

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
          <p className="text-gray-600">
            Products from all categories. Use the filters below to narrow down your search.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <ProductsSearch currentSearch={search} />
        </div>

        {/* Filters Bar - Secondary Navbar */}
        <div className="sticky top-16 z-40 mb-8">
          <ProductsFiltersBar
            categories={categories}
            currentFilters={{
              category,
              minPrice,
              maxPrice,
              sort
            }}
            totalResults={total}
          />
        </div>

        {/* Products Grid - Full Width */}
        <div className="w-full">
          <Suspense fallback={<ProductsGridSkeleton />}>
            <ProductsGrid 
              products={products}
              total={total}
              currentPage={page}
              totalPages={totalPages}
              currentParams={params}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-t-lg"></div>
          <CardContent className="p-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
