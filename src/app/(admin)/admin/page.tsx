// app/admin/page.tsx
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { requireAdmin } from '@/lib/auth/adminAuth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Category from '@/models/Category';
import { Users, Package, ShoppingCart, TrendingUp, Plus, Eye, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const admin = await requireAdmin();
  await dbConnect();

  // Fetch real data from database
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalCategories,
    activeProducts,
    inactiveUsers,
    lowStockProducts,
    recentOrders,
    recentUsers
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Category.countDocuments(),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),
    Product.countDocuments({ quantity: { $lte: 5 } }),
    Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    User.find({ role: 'student' })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
  ]);

  // Calculate revenue from orders
  const revenueResult = await Order.aggregate([
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  const totalRevenue = revenueResult[0]?.total || 0;

  // Calculate growth percentages (mock for now - you can implement real calculations)
  const stats = {
    totalUsers,
    totalProducts,
    totalOrders,
    revenue: totalRevenue,
    activeProducts,
    totalCategories,
    lowStockProducts,
    inactiveUsers
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

// ✅ Solution: Use consistent formatting or suppress hydration
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toISOString().split('T')[0];
};


  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold">Welcome back, {admin.name}!</h2>
          <p className="mt-1 opacity-90">
            Here’s a quick overview of your store's performance and recent activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.inactiveUsers} inactive accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeProducts} active products
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Total orders placed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats.revenue)}</div>
              <p className="text-xs text-muted-foreground">
                Total sales revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        {(stats.lowStockProducts > 0 || stats.inactiveUsers > 0) && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-800">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-yellow-700">
                {stats.lowStockProducts > 0 && (
                  <p>• {stats.lowStockProducts} products have low stock (≤5 items)</p>
                )}
                {stats.inactiveUsers > 0 && (
                  <p>• {stats.inactiveUsers} user accounts are inactive</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </div>
              <Link href="/admin/orders">
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order: any) => (
                    <div key={order._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">#{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">
                          {order.user?.name || 'Unknown User'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatPrice(order.totalAmount)}</p>
                        <Badge variant="outline" className="text-xs">
                          {order.orderStatus}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No orders yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>New Users</CardTitle>
                <CardDescription>Recently registered students</CardDescription>
              </div>
              <Link href="/admin/users">
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.length > 0 ? (
                  recentUsers.map((user: any) => (
                    <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{formatDate(user.createdAt)}</p>
                        <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-xs">
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No new users</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/products/create">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <Plus className="h-5 w-5" />
                  <span className="text-sm">Add Product</span>
                </Button>
              </Link>
              
              <Link href="/admin/categories/create">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <Plus className="h-5 w-5" />
                  <span className="text-sm">Add Category</span>
                </Button>
              </Link>
              
              <Link href="/admin/products">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <Package className="h-5 w-5" />
                  <span className="text-sm">Manage Products</span>
                </Button>
              </Link>
              
              <Link href="/admin/users">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Manage Users</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.totalCategories}</div>
              <p className="text-sm text-gray-500">Product categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Low Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.lowStockProducts}</div>
              <p className="text-sm text-gray-500">Products need restocking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.activeProducts}</div>
              <p className="text-sm text-gray-500">Currently available</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
