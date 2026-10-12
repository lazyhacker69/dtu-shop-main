// app/profile/edit/page.tsx - Updated with Sonner
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Save, 
  User, 
  GraduationCap,
  Upload,
  X,
  Loader2
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  collegeId: z.string().optional(),
  department: z.string().optional(),
  year: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const departments = [
  'Computer Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Mathematics & Computing',
  'Engineering Physics',
];

const years = ['1', '2', '3', '4'];

export default function ProfileEditPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      collegeId: '',
      department: '',
      year: '',
      bio: '',
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin?callbackUrl=/profile/edit');
      return;
    }

    if (user) {
      const extendedUser = user as any;
      form.reset({
        name: extendedUser.name || '',
        email: extendedUser.email || '',
        phone: extendedUser.phone || '',
        collegeId: extendedUser.collegeId || '',
        department: extendedUser.department || '',
        year: extendedUser.year?.toString() || '',
        bio: extendedUser.bio || '',
      });
      setProfileImage(extendedUser.image || null);
    }
  }, [isAuthenticated, authLoading, router, user, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Invalid file type', {
          description: 'Please select an image file.',
        });
        return;
      }

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File too large', {
          description: 'Image must be less than 2MB.',
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      toast.success('Image selected', {
        description: 'Image ready for upload.',
      });
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return profileImage;

    setUploadingImage(true);
    const uploadPromise = new Promise<string>(async (resolve, reject) => {
      try {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const response = await fetch('/api/user/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          resolve(result.url);
        } else {
          const error = await response.json();
          reject(new Error(error.error));
        }
      } catch (error: any) {
        reject(error);
      } finally {
        setUploadingImage(false);
      }
    });

    // Use Sonner's promise toast
    toast.promise(uploadPromise, {
      loading: 'Uploading image...',
      success: 'Image uploaded successfully!',
      error: (error) => `Upload failed: ${error.message}`,
    });

    try {
      return await uploadPromise;
    } catch (error) {
      return null;
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    
    try {
      let imageUrl = profileImage;
      if (imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          setIsLoading(false);
          return; // Upload failed, don't proceed
        }
      }

      const submitData = {
        ...data,
        image: imageUrl || undefined, // Convert null to undefined
        year: data.year ? parseInt(data.year) : undefined,
      };

      // Update profile
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!', {
          description: 'Your changes have been saved.',
          action: {
            label: 'View Profile',
            onClick: () => router.push('/profile'),
          },
        });
        setTimeout(() => router.push('/profile'), 2000);
      } else {
        const error = await response.json();
        toast.error('Update failed', {
          description: error.message || 'Failed to update profile.',
        });
      }
    } catch (error) {
      toast.error('Unexpected error', {
        description: 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/profile">
            <Button variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-600">Update your personal information and preferences</p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Picture */}
          <Card>
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-red-600" />
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-24 h-24 object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  {profileImage && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => {
                        setProfileImage(null);
                        setImageFile(null);
                        toast.success('Image removed');
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="profile-image" className="cursor-pointer">
                    <div className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 hover:bg-gray-50">
                      <Upload className="w-4 h-4" />
                      <span>Upload Photo</span>
                    </div>
                  </Label>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-red-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    className={form.formState.errors.name ? 'border-red-500' : ''}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    className={form.formState.errors.email ? 'border-red-500' : ''}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    {...form.register('phone')}
                  />
                </div>

                <div>
                  <Label htmlFor="collegeId">College ID</Label>
                  <Input
                    id="collegeId"
                    placeholder="2K21/CO/123"
                    {...form.register('collegeId')}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  rows={3}
                  {...form.register('bio')}
                  className={form.formState.errors.bio ? 'border-red-500' : ''}
                />
                {form.formState.errors.bio && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.bio.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="flex items-center">
                <GraduationCap className="mr-2 h-5 w-5 text-red-600" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={form.watch('department')}
                    onValueChange={(value) => form.setValue('department', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select
                    value={form.watch('year')}
                    onValueChange={(value) => form.setValue('year', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          Year {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button 
              type="submit" 
              disabled={isLoading || uploadingImage}
              className="bg-red-600 hover:bg-red-700 flex-1 sm:flex-none"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
            
            <Link href="/profile">
              <Button variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
