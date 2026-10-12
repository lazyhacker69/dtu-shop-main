// components/products/ProductsFilters.tsx - Fix empty string values
"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { X, Filter } from 'lucide-react';

interface ProductsFiltersProps {
  categories: any[];
  currentFilters: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
}

export default function ProductsFilters({ categories, currentFilters }: ProductsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [category, setCategory] = useState(currentFilters.category || 'all');
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || '');
  const [sort, setSort] = useState(currentFilters.sort || 'newest');

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

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="mr-2 h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
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
        </div>

        <Separator />

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Price Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="minPrice" className="text-xs text-gray-500">Min</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="₹0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="maxPrice" className="text-xs text-gray-500">Max</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="₹10000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Sort */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Sort By</Label>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
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

        {/* Action Buttons */}
        <div className="space-y-2 pt-4">
          <Button onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
          <Button onClick={clearFilters} variant="outline" className="w-full">
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
