// app/categories/page.tsx - Improved with red theme and no stats
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { Package, ArrowRight, Grid3X3, ShoppingBag } from 'lucide-react';

export default async function CategoriesPage() {
  await dbConnect();

  // Fetch categories with product counts
  const categoriesRaw = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  // Get product counts for each category
  const categoriesWithCounts = await Promise.all(
    categoriesRaw.map(async (category: any) => {
      const productCount = await Product.countDocuments({
        category: category._id,
        isActive: true
      });

      return {
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        image: category.image,
        sortOrder: category.sortOrder,
        productCount
      };
    })
  );

  const totalProducts = categoriesWithCounts.reduce((sum, cat) => sum + cat.productCount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <Grid3X3 className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore our wide range of categories and find exactly what you need for your DTU college life. 
            Browse through {categoriesWithCounts.length} categories with {totalProducts} products.
          </p>
        </div>

        {/* Categories Grid */}
        {categoriesWithCounts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {categoriesWithCounts.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="group"
              >
              <Card className="h-full hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 border-gray-200 hover:border-red-200">
                <CardContent className="p-4">
                  <div className="text-center space-y-4">
                    {/* Category Image/Icon - Much Larger */}
                    <div className="relative">
                      {category.image ? (
                        <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto overflow-hidden bg-gray-100 group-hover:scale-105 transition-transform duration-300">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                            style={{ objectFit: 'cover', width: '95%', height: '95%', margin: '0 auto' }}
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <Package className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
                        </div>
                      )}
                      
                      {/* Product Count Badge */}
                      <Badge 
                        className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white text-xs"
                      >
                        {category.productCount}
                      </Badge>
                    </div>

                    {/* Category Info - Compact */}
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {category.productCount} product{category.productCount !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* View Category Button - Smaller */}
                    <div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-red-600 text-red-600 hover:bg-red-50 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 text-xs px-3 py-1"
                      >
                        Browse
                        <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 sm:py-24">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">No categories found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Categories will appear here once they are added by the admin team.
            </p>
            <Link href="/products">
              <Button className="bg-red-600 hover:bg-red-700">
                <Package className="mr-2 w-4 h-4" />
                Browse All Products
              </Button>
            </Link>
          </div>
        )}

        {/* Call to Action Section */}
        <div className="mt-16 sm:mt-24 bg-white border border-gray-200 p-8 sm:p-12 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Browse all products or use our search feature to find exactly what you need for your studies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                  <Package className="mr-2 w-4 h-4" />
                  View All Products
                </Button>
              </Link>
              <Link href="/products?featured=true">
                <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 w-full sm:w-auto">
                  <ArrowRight className="mr-2 w-4 h-4" />
                  Featured Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
