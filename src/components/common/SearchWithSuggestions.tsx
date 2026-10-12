// components/common/SearchWithSuggestions.tsx - Enhanced search with suggestions
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, Clock, TrendingUp } from 'lucide-react';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'product';
}

export default function SearchWithSuggestions() {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock suggestions - replace with actual API call
  const mockSuggestions: SearchSuggestion[] = [
    { id: '1', text: 'MacBook Pro', type: 'trending' },
    { id: '2', text: 'iPhone 15', type: 'trending' },
    { id: '3', text: 'Data Structures Book', type: 'recent' },
    { id: '4', text: 'College Hoodie', type: 'recent' },
    { id: '5', text: 'Notebook Set', type: 'product' },
  ];

  useEffect(() => {
    if (search.length > 2) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setSuggestions(mockSuggestions.filter(s => 
          s.text.toLowerCase().includes(search.toLowerCase())
        ));
        setIsLoading(false);
        setShowSuggestions(true);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [search]);

  const handleSearch = (query: string = search) => {
    if (query.trim() !== '') {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setSearch('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.text);
  };

  return (
    <div ref={searchRef} className="relative max-w-md">
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
        <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search for products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => search.length > 2 && setShowSuggestions(true)}
          className="w-full pl-12 pr-20 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
        <Button 
          type="submit"
          className="absolute right-2 top-2 h-12 px-6"
          disabled={!search.trim()}
        >
          Search
        </Button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                >
                  {suggestion.type === 'recent' ? (
                    <Clock className="w-4 h-4 text-gray-400" />
                  ) : suggestion.type === 'trending' ? (
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Search className="w-4 h-4 text-gray-400" />
                  )}
                  <span>{suggestion.text}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No suggestions found</div>
          )}
        </div>
      )}
    </div>
  );
}
