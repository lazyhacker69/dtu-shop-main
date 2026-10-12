// app/admin/categories/page.tsx
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { requireAdmin } from '@/lib/auth/adminAuth';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import Link from 'next/link';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';

export default async function AdminCategories() {
  await requireAdmin();
  await dbConnect();

  // Fetch all categories
  const categories = await Category.find({})
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  return (
    <AdminLayout title="Category Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Categories</h2>
            <p className="text-gray-600">Manage product categories</p>
          </div>
          <Link href="/admin/categories/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
            <CardDescription>
              Total: {categories.length} categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category: any) => (
                <Card key={category._id.toString()} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {category.image && (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <p className="text-sm text-gray-500">Sort Order: {category.sortOrder}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant={category.isActive ? 'default' : 'secondary'}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <div className="flex space-x-1">
                          <Link href={`/admin/categories/${category._id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/categories/${category._id}/edit`}>
                            <Button size="sm" variant="outline">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
