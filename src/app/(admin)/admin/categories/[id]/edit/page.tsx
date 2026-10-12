// app/admin/categories/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categoryUpdateSchema, type CategoryUpdateInput } from '@/schemas/category';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CategoryEditPageProps {
  params: Promise<{ id: string }>;
}

export default function CategoryEditPage({ params }: CategoryEditPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string>('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CategoryUpdateInput>({
    resolver: zodResolver(categoryUpdateSchema),
  });

  // Load category data
  useEffect(() => {
    const loadData = async () => {
      try {
        const resolvedParams = await params;
        setCategoryId(resolvedParams.id);

        // Fetch category data
        const response = await fetch(`/api/categories/${resolvedParams.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load category');
        }

        const category = data.category;

        // Set form values
        setValue('name', category.name);
        setValue('image', category.image || '');
        setValue('isActive', category.isActive);
        setValue('sortOrder', category.sortOrder);

      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [params, setValue]);

  const onSubmit = async (data: CategoryUpdateInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update category');
      }

      setSuccess('Category updated successfully!');
      
      // Redirect to categories list after 2 seconds
      setTimeout(() => {
        router.push('/admin/categories');
      }, 2000);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <AdminLayout title="Edit Category">
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Category">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/categories">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold">Edit Category</h2>
            <p className="text-gray-600">Update category information</p>
          </div>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
            <CardDescription>Update the category details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter category name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  {...register('image')}
                  placeholder="Enter image URL"
                  className={errors.image ? 'border-red-500' : ''}
                />
                {errors.image && (
                  <p className="text-sm text-red-500 mt-1">{errors.image.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  {...register('sortOrder', { valueAsNumber: true })}
                  placeholder="0"
                  className={errors.sortOrder ? 'border-red-500' : ''}
                />
                {errors.sortOrder && (
                  <p className="text-sm text-red-500 mt-1">{errors.sortOrder.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  {...register('isActive')}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Category'
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/admin/categories')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
