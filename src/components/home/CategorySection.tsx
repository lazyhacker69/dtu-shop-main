// components/home/CategorySection.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  image?: string;
  slug: string;
}

interface CategorySectionProps {
  categories: Category[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find exactly what you need from our wide range of categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/categories/${category.slug}`}
              className="group"
            >
            <div className="bg-white p-4 sm:p-6 text-center hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
              <div className="w-full h-28 sm:h-28 mx-auto mb-4 group-hover:scale-105 transition-transform">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    style={{ objectFit: 'cover', width: '95%', height: '95%', margin: '0 auto' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center border border-gray-200" style={{ width: '95%', height: '95%', margin: '0 auto' }}>
                    <span className="text-gray-600 font-bold text-2xl">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors text-sm sm:text-base">
                {category.name}
              </h3>
            </div>

            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/categories">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              View All Categories
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}