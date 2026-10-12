// components/products/ProductsSearch.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface ProductsSearchProps {
  currentSearch: string;
}

export default function ProductsSearch({ currentSearch }: ProductsSearchProps) {
  const [search, setSearch] = useState(currentSearch);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSearch} className="flex gap-4 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for products, categories, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
        <Button type="submit" size="lg">
          Search
        </Button>
      </form>
    </div>
  );
}
