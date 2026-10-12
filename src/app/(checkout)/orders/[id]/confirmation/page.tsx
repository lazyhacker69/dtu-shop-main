// app/orders/[id]/confirmation/page.tsx
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  CreditCard,
  ArrowRight,
  Download,
  Share,
  Clock,
  Phone,
  Mail
} from 'lucide-react';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

interface OrderConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/orders/' + id + '/confirmation');
  }

  await dbConnect();

  const orderRawData = await Order.findOne({
    _id: id,
    user: session.user.id
  }).lean();

  if (!orderRawData) {
    notFound();
  }

  // Type assertion to fix TypeScript error
  const orderData = orderRawData as any;

  const order = {
    _id: orderData._id.toString(),
    orderNumber: orderData.orderNumber,
    items: orderData.items,
    totalAmount: orderData.totalAmount,
    subtotal: orderData.subtotal,
    tax: orderData.tax,
    shipping: orderData.shipping,
    status: orderData.status,
    paymentStatus: orderData.paymentStatus,
    paymentMethod: orderData.paymentMethod,
    shippingAddress: orderData.shippingAddress,
    notes: orderData.notes,
    createdAt: orderData.createdAt,
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

  const getEstimatedDelivery = () => {
    const orderDate = new Date(order.createdAt);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(orderDate.getDate() + 5); // 5 business days
    
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Thank you for your order. We've received your order and will begin processing it shortly.
          </p>
          <div className="mt-6 inline-flex items-center bg-white border border-gray-200 px-6 py-3">
            <span className="text-sm text-gray-600 mr-2">Order Number:</span>
            <span className="text-lg font-bold text-red-600">#{order.orderNumber}</span>
          </div>
        </div>

        {/* Order Timeline */}
        <Card className="mb-8">
          <CardHeader className="border-b border-gray-200">
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Order Placed</h3>
                  <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Processing</h3>
                  <p className="text-sm text-gray-500">Within 24 hours</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Shipped</h3>
                  <p className="text-sm text-gray-500">2-3 business days</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Delivered</h3>
                  <p className="text-sm text-gray-500">{getEstimatedDelivery()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader className="border-b border-gray-200">
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
                      <img
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-20 h-20 object-cover border border-gray-200"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Quantity: {item.quantity}
                        </p>
                        {item.selectedVariants && item.selectedVariants.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.selectedVariants.map((variant: any, vIndex: number) => (
                              <Badge key={vIndex} variant="outline" className="text-xs">
                                {variant.type}: {variant.value}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-medium text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatPrice(item.price)} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5 text-red-600" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Delivery Address</h4>
                    <div className="text-gray-700 space-y-1">
                      <p className="font-medium">{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.phone}</p>
                      <p className="mt-2">
                        {order.shippingAddress.street}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                        {order.shippingAddress.zipCode}
                      </p>
                      {order.shippingAddress.landmark && (
                        <p className="text-sm text-gray-600">
                          Landmark: {order.shippingAddress.landmark}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Delivery Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Processing Time</p>
                          <p className="text-sm text-gray-600">1-2 business days</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Truck className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Estimated Delivery</p>
                          <p className="text-sm text-gray-600">{getEstimatedDelivery()}</p>
                        </div>
                      </div>
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 capitalize mb-1">
                      {order.paymentMethod.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: <span className="capitalize font-medium">{order.paymentStatus}</span>
                    </p>
                    {order.paymentMethod === 'cash_on_delivery' && (
                      <p className="text-sm text-green-600 mt-1">
                        💰 Pay when you receive your order
                      </p>
                    )}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={order.paymentStatus === 'paid' ? 'border-green-500 text-green-700' : 'border-yellow-500 text-yellow-700'}
                  >
                    {order.paymentStatus}
                  </Badge>
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

          {/* Right Column - Order Summary & Actions */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Order Summary */}
              <Card className="sticky top-24">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (GST 18%)</span>
                      <span>{formatPrice(order.tax)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>
                        {order.shipping === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          formatPrice(order.shipping)
                        )}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Paid</span>
                    <span className="text-red-600">{formatPrice(order.totalAmount)}</span>
                  </div>

                  <div className="space-y-3 mt-6">
                    <Link href={`/orders/${order._id}`}>
                      <Button className="w-full bg-red-600 hover:bg-red-700">
                        <Package className="mr-2 h-4 w-4" />
                        Track Your Order
                      </Button>
                    </Link>
                    
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Invoice
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      <Share className="mr-2 h-4 w-4" />
                      Share Order Details
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card>
                <CardHeader className="border-b border-gray-200">
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium">Call Support</p>
                        <p className="text-sm text-gray-600">+91 9876543210</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium">Email Support</p>
                        <p className="text-sm text-gray-600">support@dtushop.com</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>

              {/* What's Next */}
              <Card>
                <CardHeader className="border-b border-gray-200">
                  <CardTitle>What Happens Next?</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Order Confirmation</p>
                        <p className="text-xs text-gray-600">You'll receive an email confirmation shortly</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Processing</p>
                        <p className="text-xs text-gray-600">We'll prepare your items for shipping</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Shipping Updates</p>
                        <p className="text-xs text-gray-600">Track your package in real-time</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">4</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Delivery</p>
                        <p className="text-xs text-gray-600">Enjoy your new purchase!</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-12">
          <div className="bg-white border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thank you for choosing DTU Shop!</h3>
            <p className="text-gray-600 mb-6">
              Continue exploring our marketplace for more amazing deals from fellow DTU students.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button variant="outline" size="lg">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/orders">
                <Button size="lg" className="bg-red-600 hover:bg-red-700">
                  View All Orders
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
