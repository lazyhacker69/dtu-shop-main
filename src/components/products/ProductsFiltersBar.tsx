// components/products/ProductsFiltersBar.tsx
"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  X, 
  SlidersHorizontal, 
  Search,
  ChevronDown
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ProductsFiltersBarProps {
  categories: any[];
  currentFilters: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
  totalResults: number;
}

export default function ProductsFiltersBar({ 
  categories, 
  currentFilters, 
  totalResults 
}: ProductsFiltersBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [category, setCategory] = useState(currentFilters.category || 'all');
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || '');
  const [sort, setSort] = useState(currentFilters.sort || 'newest');
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (category && category !== 'all') params.set('category', category);
    else params.delete('category');
    
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    
    if (sort && sort !== 'newest') params.set('sort', sort);
    else params.delete('sort');
    
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('sort');
    
    router.push(`/products?${params.toString()}`);
  };

  const hasActiveFilters = category !== 'all' || minPrice || maxPrice || sort !== 'newest';
  const activeFiltersCount = [
    category !== 'all',
    minPrice,
    maxPrice,
    sort !== 'newest'
  ].filter(Boolean).length;

  return (
<div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    {/* Left Side - Filters */}
    <div className="flex flex-col gap-3 w-full lg:flex-row lg:flex-wrap lg:items-center">
      {/* Results Count */}
      <div className="flex items-center text-sm text-gray-600">
        <span className="font-medium">{totalResults}</span>
        <span className="ml-1">products found</span>
      </div>

      {/* Category Filter */}
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat._id} value={cat._id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Price Range Filter */}
      <Popover open={showPriceFilter} onOpenChange={setShowPriceFilter}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2 w-full sm:w-auto">
            <SlidersHorizontal className="w-4 h-4" />
            Price Range
            {(minPrice || maxPrice) && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {minPrice && maxPrice ? `₹${minPrice}-₹${maxPrice}` : 
                 minPrice ? `₹${minPrice}+` : 
                 `Up to ₹${maxPrice}`}
              </Badge>
            )}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 max-w-[90vw]">
          <div className="space-y-4">
            <h4 className="font-medium">Price Range</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Min Price</label>
                <Input
                  type="number"
                  placeholder="₹0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Max Price</label>
                <Input
                  type="number"
                  placeholder="₹10000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => {
                  applyFilters();
                  setShowPriceFilter(false);
                }}
                className="flex-1"
              >
                Apply
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Filter className="w-3 h-3" />
            {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearFilters}
            className="h-6 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear all
          </Button>
        </div>
      )}
    </div>

    {/* Right Side - Sort and Apply */}
    <div className="flex flex-col gap-3 w-full sm:flex-row sm:items-center sm:justify-end lg:w-auto">
      {/* Sort */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Apply Button */}
      <Button onClick={applyFilters} className="w-full sm:w-auto whitespace-nowrap">
        Apply Filters
      </Button>
    </div>
  </div>
</div>

  );
}
