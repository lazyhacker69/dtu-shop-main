// components/admin/AdminFloatingButton.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AdminFloatingButton() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link href="/admin">
        <Button 
          size="lg"
          className="bg-red-600 hover:bg-red-700 text-white shadow-lg rounded-full h-14 w-14 p-0"
          title="Admin Panel"
        >
          <ShieldCheck className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
}
