// app/admin/users/[id]/not-found.tsx
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, UserX } from 'lucide-react';

export default function UserNotFound() {
  return (
    <AdminLayout title="User Not Found">
      <div className="min-h-96 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <UserX className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="text-xl font-semibold">User Not Found</h2>
              <p className="text-gray-600">
                The user you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/admin/users">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Users
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
