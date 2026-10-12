// components/admin/AdminBadge.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

export default function AdminBadge() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return null;
  }

  return (
    <Badge variant="destructive" className="ml-2">
      <ShieldCheck className="mr-1 h-3 w-3" />
      Admin
    </Badge>
  );
}
