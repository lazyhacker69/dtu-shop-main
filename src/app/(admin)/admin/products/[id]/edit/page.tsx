// app/admin/products/[id]/edit/page.tsx - Enhanced with Cloudinary
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { productUpdateSchema, type ProductUpdateInput } from '@/schemas/product';
import { useForm, Controller } from 'react-hook-form';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, X, ArrowLeft, Upload, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Category {
  _id: string;
  name: string;
}

interface ProductEditPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(new Set());
  const [tags, setTags] = useState<string[]>(['']);
  const [productId, setProductId] = useState<string>('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset
  } = useForm<ProductUpdateInput>({
    resolver: zodResolver(productUpdateSchema),
    defaultValues: {
      isActive: true,
      isFeatured: false,
    }
  });

  const isActive = watch('isActive');
  const isFeatured = watch('isFeatured');

  // Load product data and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        const resolvedParams = await params;
        setProductId(resolvedParams.id);

        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);

        // Fetch product data
        const productResponse = await fetch(`/api/products/${resolvedParams.id}`);
        const productData = await productResponse.json();

        if (!productResponse.ok) {
          throw new Error(productData.error || 'Failed to load product');
        }

        const product = productData.product;

        reset({
          name: product.name,
          description: product.description,
          shortDescription: product.shortDescription || '',
          price: product.price,
          comparePrice: product.comparePrice,
          category: product.category._id,
          quantity: product.quantity,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          images: product.images || [],
          tags: product.tags || [],
          variants: product.variants || []
        });

        // Set images and tags for UI
        setImageUrls(product.images.length > 0 ? product.images : ['']);
        setTags(product.tags.length > 0 ? product.tags : ['']);

      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [params, reset]);

  // Image handling functions
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, GIF)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setUploadingImages(prev => new Set(prev).add(index));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Upload failed');
      }

      const data = await response.json();
      if (!data.secure_url) {
        throw new Error('No image URL returned from Cloudinary');
      }

      // Update image URL
      const newUrls = [...imageUrls];
      newUrls[index] = data.secure_url;
      setImageUrls(newUrls);
      setValue('images', newUrls.filter(url => url.trim() !== ''));
      
      toast.success('Image uploaded successfully!');

    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    setValue('images', newUrls.filter(url => url.trim() !== ''));
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
    setValue('images', newUrls.filter(url => url.trim() !== ''));
  };

  // Tag handling functions
  const addTag = () => {
    setTags([...tags, '']);
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    setValue('tags', newTags.filter(tag => tag.trim() !== ''));
  };

  const updateTag = (index: number, value: string) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
    setValue('tags', newTags.filter(tag => tag.trim() !== ''));
  };

  // Delete product function
  const handleDeleteProduct = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }

      toast.success('Product deleted successfully!');
      router.push('/admin/products');

    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProductUpdateInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update product');
      }

      setSuccess('Product updated successfully!');
      toast.success('Product updated successfully!');
      
      setTimeout(() => {
        router.push(`/admin/products`);
      }, 2000);

    } catch (error: any) {
      setError(error.message);
      toast.error(`Update failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <AdminLayout title="Edit Product">
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Product">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/products">
              <Button variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-50">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold">Edit Product</h2>
              <p className="text-gray-600">Update product information</p>
            </div>
          </div>

          {/* Delete Button */}
          <Button
            variant="destructive"
            onClick={handleDeleteProduct}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete Product
          </Button>
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Product Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Essential product details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Enter product name"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Input
                      id="shortDescription"
                      {...register('shortDescription')}
                      placeholder="Brief product description"
                      className={errors.shortDescription ? 'border-red-500' : ''}
                    />
                    {errors.shortDescription && (
                      <p className="text-sm text-red-500 mt-1">{errors.shortDescription.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Full Description</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="Detailed product description"
                      rows={4}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category._id} value={category._id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.category && (
                      <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Images with Cloudinary Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>Upload or update product images</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <Input
                          value={url}
                          onChange={(e) => updateImageUrl(index, e.target.value)}
                          placeholder="Enter image URL or upload file"
                          className="flex-1"
                        />
                        {imageUrls.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeImageUrl(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      {/* File Upload Option */}
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`file-upload-${index}`} className="cursor-pointer">
                          <div className="flex items-center space-x-2 bg-white border border-red-600 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-50 transition-colors">
                            <Upload className="w-3 h-3" />
                            <span>Upload</span>
                          </div>
                        </Label>
                        <input
                          id={`file-upload-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, index)}
                          className="hidden"
                          disabled={uploadingImages.has(index)}
                        />
                        {uploadingImages.has(index) && (
                          <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                        )}
                      </div>

                      {/* Image Preview */}
                      {url && (
                        <img
                          src={url}
                          alt={`Preview ${index}`}
                          className="w-24 h-24 object-cover rounded border"
                        />
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImageUrl}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Image
                  </Button>
                  {errors.images && (
                    <p className="text-sm text-red-500">{errors.images.message}</p>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                  <CardDescription>Update tags for better searchability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tags.map((tag, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={tag}
                        onChange={(e) => updateTag(index, e.target.value)}
                        placeholder="Enter tag"
                        className="flex-1"
                      />
                      {tags.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTag(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTag}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Tag
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...register('price', { valueAsNumber: true })}
                      placeholder="0.00"
                      className={errors.price ? 'border-red-500' : ''}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="comparePrice">Compare Price (₹)</Label>
                    <Input
                      id="comparePrice"
                      type="number"
                      step="0.01"
                      {...register('comparePrice', { valueAsNumber: true })}
                      placeholder="0.00"
                      className={errors.comparePrice ? 'border-red-500' : ''}
                    />
                    {errors.comparePrice && (
                      <p className="text-sm text-red-500 mt-1">{errors.comparePrice.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      {...register('quantity', { valueAsNumber: true })}
                      placeholder="0"
                      className={errors.quantity ? 'border-red-500' : ''}
                    />
                    {errors.quantity && (
                      <p className="text-sm text-red-500 mt-1">{errors.quantity.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="isActive"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="isActive"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="isActive">Active Product</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="isFeatured"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="isFeatured"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="isFeatured">Featured Product</Label>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>Status: {isActive ? 'Active' : 'Inactive'}</p>
                    <p>Featured: {isFeatured ? 'Yes' : 'No'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-2">
                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Product'
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/admin/products')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
