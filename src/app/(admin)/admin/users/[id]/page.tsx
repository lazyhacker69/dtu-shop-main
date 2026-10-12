// app/admin/users/[id]/page.tsx
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { requireAdmin } from '@/lib/auth/adminAuth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import UserActionButtons from '@/components/admin/UserActionButtons';
import Link from 'next/link';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, User as UserIcon } from 'lucide-react';
import { notFound } from 'next/navigation';

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  await requireAdmin();
  await dbConnect();

  const { id } = await params;

  const userData = await User.findById(id)
    .select('-password')
    .lean();

  if (!userData) {
    notFound();
  }

  const user = userData as any;

// ✅ Solution: Use consistent formatting or suppress hydration
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toISOString().split('T')[0];
};

  return (
    <AdminLayout title="User Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/users">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-gray-600">User Profile Details</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href={`/admin/users/${user._id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </Button>
            </Link>
            <UserActionButtons 
              userId={user._id.toString()}
              userName={user.name}
              userRole={user.role}
              isActive={user.isActive}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserIcon className="mr-2 h-5 w-5" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Image */}
                <div className="flex flex-col items-center">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center border-4 border-gray-200">
                      <span className="text-2xl font-bold text-gray-700">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <h3 className="mt-4 text-xl font-semibold">{user.name}</h3>
                  <Badge variant={user.role === 'admin' ? 'destructive' : 'default'} className="mt-2">
                    {user.role}
                  </Badge>
                </div>

                {/* Status */}
                <div className="text-center">
                  <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-sm">
                    {user.isActive ? 'Active Account' : 'Inactive Account'}
                  </Badge>
                </div>

                {/* Quick Stats */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Member Since</span>
                    <span className="text-sm font-medium">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last Updated</span>
                    <span suppressHydrationWarning className="text-sm font-medium">
                      
                      {new Date(user.updatedAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>User's contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                {user.address && (
                  <div className="flex items-start space-x-3 pt-4 border-t">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <div className="font-medium">
                        <p>{user.address.street}</p>
                        <p>{user.address.city}, {user.address.state}</p>
                        <p>{user.address.zipCode}, {user.address.country}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
                <CardDescription>College and academic details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">College ID</p>
                    <p className="font-medium font-mono">
                      {user.collegeId || 'Not provided'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">
                      {user.department || 'Not specified'}
                    </p>
                  </div>
                  
                  {user.year && (
                    <div>
                      <p className="text-sm text-gray-500">Year</p>
                      <p className="font-medium">Year {user.year}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Account Activity
                </CardTitle>
                <CardDescription>Account creation and modification history</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Account Created</p>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Last Modified</p>
                    <p className="font-medium">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {user.role === 'admin' ? '∞' : '0'}
                      </p>
                      <p className="text-sm text-gray-500">Admin Actions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">0</p>
                      <p className="text-sm text-gray-500">Orders Placed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">0</p>
                      <p className="text-sm text-gray-500">Products Added</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">
                        {user.isActive ? 'Active' : 'Inactive'}
                      </p>
                      <p className="text-sm text-gray-500">Status</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
