// components/categories/CategoryFilters.tsx
"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal, X, Filter } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface CategoryFiltersProps {
  currentFilters: {
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
  totalResults: number;
  categorySlug: string;
}

export default function CategoryFilters({ 
  currentFilters, 
  totalResults, 
  categorySlug 
}: CategoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || '');
  const [sort, setSort] = useState(currentFilters.sort || 'newest');
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    
    if (sort && sort !== 'newest') params.set('sort', sort);
    else params.delete('sort');
    
    router.push(`/categories/${categorySlug}?${params.toString()}`);
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    router.push(`/categories/${categorySlug}`);
  };

  const hasActiveFilters = minPrice || maxPrice || sort !== 'newest';

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Side - Results and Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">{totalResults}</span>
            <span className="ml-1">products found</span>
          </div>

          {/* Price Range Filter */}
          <Popover open={showPriceFilter} onOpenChange={setShowPriceFilter}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Price Range
                {(minPrice || maxPrice) && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {minPrice && maxPrice ? `₹${minPrice}-₹${maxPrice}` : 
                     minPrice ? `₹${minPrice}+` : 
                     `Up to ₹${maxPrice}`}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
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

          {/* Active Filters */}
          {hasActiveFilters && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearFilters}
              className="gap-1"
            >
              <X className="w-3 h-3" />
              Clear filters
            </Button>
          )}
        </div>

        {/* Right Side - Sort */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-48">
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

          <Button onClick={applyFilters}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
