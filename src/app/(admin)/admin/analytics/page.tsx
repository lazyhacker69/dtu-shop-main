import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { requireAdmin } from '@/lib/auth/adminAuth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { IndianRupee, ShoppingCart, Users, Package, TrendingUp, BarChart3 } from 'lucide-react';

const money = (value: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(value);

const shortMoney = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${Math.round(value)}`;
};

export default async function AnalyticsPage() {
  await requireAdmin();
  await dbConnect();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    revenueRows,
    thisMonthOrders,
    previousMonthOrders,
    thisMonthRevenueRows,
    previousMonthRevenueRows,
    statusBreakdown,
    paymentBreakdown,
    topProducts,
    monthlyRevenue,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, value: { $sum: '$totalAmount' } } }]),
    Order.countDocuments({ createdAt: { $gte: monthStart } }),
    Order.countDocuments({ createdAt: { $gte: previousMonthStart, $lt: monthStart } }),
    Order.aggregate([{ $match: { createdAt: { $gte: monthStart }, status: { $ne: 'cancelled' } } }, { $group: { _id: null, value: { $sum: '$totalAmount' } } }]),
    Order.aggregate([{ $match: { createdAt: { $gte: previousMonthStart, $lt: monthStart }, status: { $ne: 'cancelled' } } }, { $group: { _id: null, value: { $sum: '$totalAmount' } } }]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Order.aggregate([{ $group: { _id: '$paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }, { $sort: { count: -1 } }]),
    Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.name', quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  const totalRevenue = revenueRows[0]?.value || 0;
  const thisMonthRevenue = thisMonthRevenueRows[0]?.value || 0;
  const previousMonthRevenue = previousMonthRevenueRows[0]?.value || 0;
  const revenueGrowth = previousMonthRevenue > 0
    ? ((thisMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
    : thisMonthRevenue > 0 ? 100 : 0;
  const orderGrowth = previousMonthOrders > 0
    ? ((thisMonthOrders - previousMonthOrders) / previousMonthOrders) * 100
    : thisMonthOrders > 0 ? 100 : 0;
  const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map((row: any) => row.revenue), 1);
  const maxTopQuantity = Math.max(...topProducts.map((row: any) => row.quantity), 1);
  const maxStatus = Math.max(...statusBreakdown.map((row: any) => row.count), 1);

  const monthLabel = (month: number, year: number) => new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(year, month - 1, 1));
  const paymentNames: Record<string, string> = {
    cash_on_delivery: 'Cash on Delivery',
    upi: 'UPI',
    card: 'Card',
    net_banking: 'Net Banking',
  };

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Store Analytics</h2>
            <p className="text-sm text-gray-600">A live overview of sales, orders, customers and product performance.</p>
          </div>
          <Badge variant="outline" className="w-fit px-3 py-1">Updated from live store data</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Revenue', value: money(totalRevenue), note: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}% vs last month`, icon: IndianRupee },
            { label: 'Orders', value: totalOrders.toLocaleString('en-IN'), note: `${thisMonthOrders} this month · ${orderGrowth >= 0 ? '+' : ''}${orderGrowth.toFixed(1)}%`, icon: ShoppingCart },
            { label: 'Customers', value: totalUsers.toLocaleString('en-IN'), note: 'Registered student accounts', icon: Users },
            { label: 'Avg. Order Value', value: money(averageOrderValue), note: `${totalProducts} products in catalogue`, icon: Package },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="mt-1 text-xs text-gray-500">{stat.note}</p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-2.5 text-red-700">
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Revenue from non-cancelled orders over the last 6 months</CardDescription>
                </div>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              {monthlyRevenue.length ? (
                <div className="flex h-72 items-end gap-3 border-b border-gray-200 pb-3">
                  {monthlyRevenue.map((row: any) => {
                    const height = Math.max((row.revenue / maxMonthlyRevenue) * 100, 6);
                    return (
                      <div key={`${row._id.year}-${row._id.month}`} className="flex h-full flex-1 flex-col justify-end gap-2">
                        <div className="text-center text-xs font-medium text-gray-500">{shortMoney(row.revenue)}</div>
                        <div className="relative flex h-[85%] items-end rounded-md bg-gray-100">
                          <div className="w-full rounded-md bg-red-700 transition-all" style={{ height: `${height}%` }} title={`${money(row.revenue)} · ${row.orders} orders`} />
                        </div>
                        <div className="text-center text-xs text-gray-500">{monthLabel(row._id.month, row._id.year)}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-72 flex-col items-center justify-center text-gray-500">
                  <BarChart3 className="mb-3 h-9 w-9 text-gray-300" />
                  <p className="font-medium">No revenue data yet</p>
                  <p className="text-sm">Completed orders will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Current order pipeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusBreakdown.length ? statusBreakdown.map((row: any) => (
                <div key={row._id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="capitalize font-medium text-gray-700">{row._id}</span>
                    <span className="text-gray-500">{row.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-red-700" style={{ width: `${Math.max((row.count / maxStatus) * 100, 4)}%` }} />
                  </div>
                </div>
              )) : <p className="py-12 text-center text-sm text-gray-500">No orders yet.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Products ranked by units sold</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topProducts.length ? topProducts.map((product: any, index: number) => (
                <div key={product._id} className="flex items-center gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">{index + 1}</div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex justify-between gap-3">
                      <p className="truncate text-sm font-medium text-gray-900">{product._id}</p>
                      <span className="shrink-0 text-xs text-gray-500">{product.quantity} sold</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-red-700" style={{ width: `${Math.max((product.quantity / maxTopQuantity) * 100, 5)}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{money(product.revenue)} revenue</p>
                  </div>
                </div>
              )) : <p className="py-10 text-center text-sm text-gray-500">No product sales yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>How customers are paying</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-100">
                {paymentBreakdown.length ? paymentBreakdown.map((method: any) => (
                  <div key={method._id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{paymentNames[method._id] || method._id}</p>
                      <p className="text-xs text-gray-500">{method.count} order{method.count === 1 ? '' : 's'}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{money(method.revenue)}</p>
                  </div>
                )) : <p className="py-10 text-center text-sm text-gray-500">No payment data yet.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
