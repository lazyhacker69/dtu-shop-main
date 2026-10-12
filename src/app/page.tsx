// app/page.tsx - Use both hero sections
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategorySection from '@/components/home/CategorySection';
// import StatsSection from '@/components/home/StatsSection';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category';

import ParallaxHeroSection from '@/components/home/ParallaxHeroSection';
import HeroSection from '@/components/home/HeroSection';


export default async function HomePage() {
  await dbConnect();

  // Fetch featured products and categories
  const [featuredProductsRaw, categoriesRaw] = await Promise.all([
    Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name')
      .limit(8)
      .lean(),
    Category.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .limit(6)
      .lean()
  ]);

  // Convert ObjectIds to strings for Client Components
  const featuredProducts = featuredProductsRaw.map((product: any) => ({
    _id: product._id.toString(),
    name: product.name,
    price: product.price,
    comparePrice: product.comparePrice,
    images: product.images,
    category: {
      _id: product.category._id.toString(),
      name: product.category.name
    }
  }));

  const categories = categoriesRaw.map((category: any) => ({
    _id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    image: category.image
  }));

  return (
    <div className="min-h-screen">
      <ParallaxHeroSection />
      <HeroSection />
      <CategorySection categories={categories} />
      <FeaturedProducts products={featuredProducts} />
    </div>
  );
}
