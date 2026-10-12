// components/home/FeaturedProducts.tsx - Mobile responsive slideshow
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: {
    name: string;
  };
}

interface FeaturedProductsProps {
  products: any[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [productsPerSlide, setProductsPerSlide] = useState(4);

  // Update products per slide based on screen size
  useEffect(() => {
    const updateProductsPerSlide = () => {
      if (window.innerWidth < 640) {
        setProductsPerSlide(1); // Mobile: 1 product
      } else if (window.innerWidth < 1024) {
        setProductsPerSlide(2); // Tablet: 2 products
      } else {
        setProductsPerSlide(4); // Desktop: 4 products
      }
    };

    updateProductsPerSlide();
    window.addEventListener('resize', updateProductsPerSlide);
    return () => window.removeEventListener('resize', updateProductsPerSlide);
  }, []);

  const totalSlides = Math.ceil(products.length / productsPerSlide);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying || products.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides, products.length]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const calculateDiscount = (price: number, comparePrice: number) => {
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 sm:mb-12 space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              Featured Products
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Our Best Sellings Products Just For You
            </p>
          </div>
          
          {/* Controls - Mobile Layout */}
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Slideshow Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevSlide}
                className="h-10 w-10 p-0 border-red-600 text-red-600 hover:bg-red-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm text-gray-600 px-3">
                {currentSlide + 1} / {totalSlides}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={nextSlide}
                className="h-10 w-10 p-0 border-red-600 text-red-600 hover:bg-red-50"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            
            <Link href="/products" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border-red-600 text-red-600 hover:bg-red-50"
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Slideshow Container - Mobile Responsive */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div
                key={slideIndex}
                className="w-full flex-shrink-0"
              >
                <div className={`grid gap-4 sm:gap-6 ${
                  productsPerSlide === 1 ? 'grid-cols-1' :
                  productsPerSlide === 2 ? 'grid-cols-2' :
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                }`}>
                  {products
                    .slice(slideIndex * productsPerSlide, (slideIndex + 1) * productsPerSlide)
                    .map((product) => (
                      <Link
                        key={product._id}
                        href={`/products/${product._id}`}
                        className="group"
                      >
                        <div className="bg-white border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                          <div className="relative">
                            <img
                              src={product.images[0] || '/placeholder-product.jpg'}
                              alt={product.name}
                              className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {product.comparePrice && (
                              <Badge className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-red-600 hover:bg-red-700 text-xs">
                                {calculateDiscount(product.price, product.comparePrice)}% OFF
                              </Badge>
                            )}
                            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white p-1">
                              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                            </div>
                          </div>
                          
                          <div className="p-3 sm:p-4">
                            <Badge variant="outline" className="mb-2 text-xs">
                              {product.category.name}
                            </Badge>
                            
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors text-sm sm:text-base">
                              {product.name}
                            </h3>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-base sm:text-lg font-bold text-gray-900">
                                  {formatPrice(product.price)}
                                </span>
                                {product.comparePrice && (
                                  <span className="text-xs sm:text-sm text-gray-500 line-through ml-1 sm:ml-2 block sm:inline">
                                    {formatPrice(product.comparePrice)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                                <span className="text-xs sm:text-sm text-gray-600">4.5</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide Indicators - Mobile Responsive */}
        <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 transition-colors duration-200 ${
                index === currentSlide 
                  ? 'bg-red-600' 
                  : 'bg-gray-300 hover:bg-red-300'
              }`}
            />
          ))}
        </div>

        {/* Auto-play Toggle - Mobile Responsive */}
        <div className="flex justify-center mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="text-gray-600 hover:text-red-600 text-sm"
          >
            {isAutoPlaying ? 'Pause Slideshow' : 'Resume Slideshow'}
          </Button>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="block sm:hidden text-center mt-4">
          <p className="text-xs text-gray-500">
            Swipe left or right to browse products
          </p>
        </div>
      </div>
    </section>
  );
}
