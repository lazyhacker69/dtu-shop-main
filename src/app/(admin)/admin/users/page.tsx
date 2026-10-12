// app/admin/users/page.tsx - Updated with working filters
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { requireAdmin } from '@/lib/auth/adminAuth';
import dbConnect from '@/lib/dbConnect';
import User, { IUser } from '@/models/User';
import UserActionButtons from '@/components/admin/UserActionButtons';

import { Search, UserPlus, Download } from 'lucide-react';
import Link from 'next/link';
import UserFilters from '@/components/admin/UserFilters';

interface UserDisplay extends Omit<IUser, 'password'> {
  _id: string;
}

interface UsersPageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
    status?: string;
    department?: string;
    page?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  await requireAdmin();
  await dbConnect();

  const params = await searchParams;
  const search = params.search || '';
  const roleFilter = params.role || '';
  const statusFilter = params.status || '';
  const departmentFilter = params.department || '';
  const page = parseInt(params.page || '1');
  const limit = 20;

  // Build query
  const query: any = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { collegeId: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (roleFilter && roleFilter !== 'all') {
    query.role = roleFilter;
  }
  
  if (statusFilter === 'active') {
    query.isActive = true;
  } else if (statusFilter === 'inactive') {
    query.isActive = false;
  }
  
  if (departmentFilter && departmentFilter !== 'all') {
    query.department = { $regex: departmentFilter, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  // Fetch users and total count
  const [users, total, departments] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as unknown as Promise<UserDisplay[]>,
    User.countDocuments(query),
    User.distinct('department', { department: { $nin: [null, ''] } })
  ]);

  // Calculate stats
  const totalPages = Math.ceil(total / limit);
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const adminUsers = await User.countDocuments({ role: 'admin' });
  const studentUsers = await User.countDocuments({ role: 'student' });

  return (
    <AdminLayout title="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Users</h2>
            <p className="text-gray-600">Manage user accounts and permissions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
              <p className="text-sm text-gray-500">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
              <p className="text-sm text-gray-500">Active Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{adminUsers}</div>
              <p className="text-sm text-gray-500">Administrators</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{studentUsers}</div>
              <p className="text-sm text-gray-500">Students</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters Component */}
        <UserFilters
          departments={departments}
          currentFilters={{
            search,
            role: roleFilter,
            status: statusFilter,
            department: departmentFilter
          }}
        />

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Showing {users.length} of {total} users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">User</th>
                    <th className="text-left p-3">Role</th>
                    <th className="text-left p-3">Department</th>
                    <th className="text-left p-3">College ID</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Joined</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id.toString()} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">
                          {user.department || 'Not specified'}
                        </span>
                        {user.year && (
                          <div className="text-xs text-gray-500">Year {user.year}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="text-sm font-mono">
                          {user.collegeId || 'Not provided'}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span suppressHydrationWarning className="text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="p-3">
                        <UserActionButtons 
                          userId={user._id.toString()}
                          userName={user.name}
                          userRole={user.role}
                          isActive={user.isActive}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  {page > 1 && (
                    <Link href={`/admin/users?page=${page - 1}&search=${search}&role=${roleFilter}&status=${statusFilter}&department=${departmentFilter}`}>
                      <Button variant="outline" size="sm">Previous</Button>
                    </Link>
                  )}
                  {page < totalPages && (
                    <Link href={`/admin/users?page=${page + 1}&search=${search}&role=${roleFilter}&status=${statusFilter}&department=${departmentFilter}`}>
                      <Button variant="outline" size="sm">Next</Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
