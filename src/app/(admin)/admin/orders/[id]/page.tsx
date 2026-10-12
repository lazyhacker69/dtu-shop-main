// app/admin/orders/[id]/page.tsx - Convert to proper serialization
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Package, 
  User, 
  CreditCard,
  Truck,
  Edit,
  Download,
  Mail,
  Phone
} from 'lucide-react';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import AdminOrderActions from '@/components/admin/AdminOrderActions';

interface AdminOrderPageProps {
  params: Promise<{ id: string }>;
}

// Helper function to serialize order data for Server Components
function serializeOrderForServer(orderData: any) {
  // Convert to plain object and remove Mongoose methods
  const plainOrder = JSON.parse(JSON.stringify(orderData));
  
  return {
    _id: plainOrder._id?.toString() || '',
    orderNumber: plainOrder.orderNumber || '',
    user: {
      _id: plainOrder.user?._id?.toString() || '',
      name: plainOrder.user?.name || '',
      email: plainOrder.user?.email || '',
      phone: plainOrder.user?.phone || ''
    },
    items: (plainOrder.items || []).map((item: any) => ({
      name: item.name || '',
      price: item.price || 0,
      quantity: item.quantity || 0,
      image: item.image || '',
      selectedVariants: (item.selectedVariants || []).map((variant: any) => ({
        type: variant.type || '',
        value: variant.value || '',
        price: variant.price || 0
      }))
    })),
    totalAmount: plainOrder.totalAmount || 0,
    subtotal: plainOrder.subtotal || 0,
    tax: plainOrder.tax || 0,
    shipping: plainOrder.shipping || 0,
    status: plainOrder.status || 'pending',
    paymentStatus: plainOrder.paymentStatus || 'pending',
    paymentMethod: plainOrder.paymentMethod || 'cash_on_delivery',
    shippingAddress: {
      fullName: plainOrder.shippingAddress?.fullName || '',
      phone: plainOrder.shippingAddress?.phone || '',
      street: plainOrder.shippingAddress?.street || '',
      city: plainOrder.shippingAddress?.city || '',
      state: plainOrder.shippingAddress?.state || '',
      zipCode: plainOrder.shippingAddress?.zipCode || '',
      landmark: plainOrder.shippingAddress?.landmark || ''
    },
    notes: plainOrder.notes || '',
    createdAt: plainOrder.createdAt?.toString() || '',
    updatedAt: plainOrder.updatedAt?.toString() || ''
  };
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user || session.user.role !== 'admin') {
    notFound();
  }

  await dbConnect();

  const orderRawData = await Order.findById(id)
    .populate('user', 'name email phone')
    .lean(); // Important: use .lean() to get plain objects

  if (!orderRawData) {
    notFound();
  }

  // Serialize the order data properly
  const order = serializeOrderForServer(orderRawData);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin/orders">
              <Button variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-50">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Invoice
            </Button>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Email Customer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5 text-red-600" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200">
                      <img
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-16 h-16 object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × {formatPrice(item.price)}
                        </p>
                        {item.selectedVariants && item.selectedVariants.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.selectedVariants.map((variant: any, vIndex: number) => (
                              <Badge key={vIndex} variant="outline" className="text-xs">
                                {variant.type}: {variant.value}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-red-600" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Contact Details</h4>
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <span className="font-medium">Name:</span> {order.user.name}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Email:</span> {order.user.email}
                      </p>
                      {order.user.phone && (
                        <p className="text-gray-700">
                          <span className="font-medium">Phone:</span> {order.user.phone}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </Button>
                      {order.user.phone && (
                        <Button size="sm" variant="outline">
                          <Phone className="mr-2 h-4 w-4" />
                          Call
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
                    <div className="text-gray-700">
                      <p className="font-medium">{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.phone}</p>
                      <p className="mt-2">
                        {order.shippingAddress.street}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                        {order.shippingAddress.zipCode}
                      </p>
                      {order.shippingAddress.landmark && (
                        <p className="text-sm text-gray-600 mt-1">
                          Landmark: {order.shippingAddress.landmark}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-red-600" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Payment Method</h4>
                    <p className="text-gray-700 capitalize">
                      {order.paymentMethod.replace('_', ' ')}
                    </p>
                    <Badge className={`mt-2 ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Payment Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatPrice(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatPrice(order.tax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Notes */}
            {order.notes && (
              <Card>
                <CardHeader className="border-b border-gray-200">
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Order Actions */}
          <div className="lg:col-span-1">
            <AdminOrderActions order={order} />
          </div>
        </div>
      </div>
    </div>
  );
}
