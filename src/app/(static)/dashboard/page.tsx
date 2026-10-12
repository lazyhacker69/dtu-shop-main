// app/dashboard/page.tsx
"use client";

import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Please sign in to access the dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome to your college marketplace</p>
          </div>
          
          {/* Admin Panel Access Button - Only visible to admins */}
          {isAdmin && (
            <Link href="/admin">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Admin Panel
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <div className="mt-1">
                  <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                    {user.role}
                  </Badge>
                  {isAdmin && (
                    <Badge variant="outline" className="ml-2">
                      Administrator
                    </Badge>
                  )}
                </div>
              </div>
              {user.collegeId && (
                <div>
                  <label className="text-sm font-medium text-gray-500">College ID</label>
                  <p className="text-lg">{user.collegeId}</p>
                </div>
              )}
              {user.department && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-lg">{user.department}</p>
                </div>
              )}
              {user.year && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Year</label>
                  <p className="text-lg">Year {user.year}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button className="w-full" variant="outline">
                View Orders
              </Button>
              <Button className="w-full" variant="outline">
                Browse Products
              </Button>
              
              {/* Additional Admin Quick Actions */}
              {isAdmin && (
                <>
                  <hr className="my-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Admin Actions</p>
                    <Link href="/admin/users" className="block">
                      <Button className="w-full" variant="outline">
                        Manage Users
                      </Button>
                    </Link>
                    <Link href="/admin/products" className="block">
                      <Button className="w-full" variant="outline">
                        Manage Products
                      </Button>
                    </Link>
                    <Link href="/admin/orders" className="block">
                      <Button className="w-full" variant="outline">
                        View All Orders
                      </Button>
                    </Link>
                  </div>
                </>
              )}
              
              <Button 
                className="w-full" 
                variant="destructive"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Admin Statistics Card - Only visible to admins */}
        {isAdmin && (
          <div className="mt-6">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Administrator Dashboard</CardTitle>
                <CardDescription className="text-red-600">
                  You have administrative privileges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-800">150</p>
                    <p className="text-sm text-red-600">Total Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-800">45</p>
                    <p className="text-sm text-red-600">Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-800">89</p>
                    <p className="text-sm text-red-600">Orders</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <Link href="/admin">
                    <Button className="bg-red-600 hover:bg-red-700">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Go to Admin Panel
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
