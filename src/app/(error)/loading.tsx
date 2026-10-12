// app/loading.tsx
import { Loader2, Package } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
          <Package className="w-8 h-8 text-red-600" />
        </div>
        
        {/* Loading Spinner */}
        <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
        
        {/* Loading Text */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Loading DTU Shop
        </h2>
        <p className="text-gray-600">
          Please wait while we prepare your experience...
        </p>
      </div>
    </div>
  );
}
