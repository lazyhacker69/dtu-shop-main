// components/common/SearchBar.tsx - Reusable search component
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showButton?: boolean;
  onSearch?: (query: string) => void;
}

export default function SearchBar({ 
  placeholder = "Search products...", 
  className = "",
  size = 'md',
  showButton = true,
  onSearch
}: SearchBarProps) {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSearch = search.trim();
    
    if (trimmedSearch !== '') {
      if (onSearch) {
        onSearch(trimmedSearch);
      } else {
        router.push(`/products?search=${encodeURIComponent(trimmedSearch)}`);
      }
      setSearch(''); // Clear after search
    }
  };

  const sizeClasses = {
    sm: 'py-2 text-sm',
    md: 'py-3 text-base',
    lg: 'py-4 text-lg'
  };

  const buttonSizes = {
    sm: 'h-8 px-3',
    md: 'h-10 px-4',
    lg: 'h-12 px-6'
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={`w-full pl-10 ${showButton ? 'pr-20' : 'pr-4'} ${sizeClasses[size]} border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm`}
      />
      {showButton && (
        <Button 
          type="submit"
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${buttonSizes[size]}`}
          disabled={!search.trim()}
        >
          Search
        </Button>
      )}
    </form>
  );
}
