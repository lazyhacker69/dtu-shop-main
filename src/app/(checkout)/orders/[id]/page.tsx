// app/orders/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  RotateCcw,
  Loader2,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedVariants?: {
    type: string;
    value: string;
    price: number;
  }[];
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    landmark?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin?callbackUrl=/orders/' + orderId);
      return;
    }

    if (isAuthenticated && orderId) {
      fetchOrder();
    }
  }, [isAuthenticated, authLoading, router, orderId]);

  const fetchOrder = async () => {
    try {
      console.log('Fetching order:', orderId); // Debug log
      
      const response = await fetch(`/api/orders/${orderId}`);
      console.log('Response status:', response.status); // Debug log
      
      if (response.ok) {
        const data = await response.json();
        console.log('Order data:', data); // Debug log
        setOrder(data.order);
      } else {
        console.error('Failed to fetch order:', response.status);
        const errorData = await response.json();
        console.error('Error details:', errorData);
        toast.error('Failed to load order details');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Error loading order details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
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
    if (!order) return '';
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
                <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
                <Link href="/orders">
                  <Button className="bg-red-600 hover:bg-red-700">
                    Back to Orders
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/orders">
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
            {order.status === 'delivered' && (
              <Button variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reorder
              </Button>
            )}
          </div>
        </div>

        {/* Order Status Timeline */}
        <Card className="mb-8">
          <CardHeader className="border-b border-gray-200">
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-red-600' : 'bg-gray-300'}`}>
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Order Placed</h3>
                  <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-red-600' : 'bg-gray-300'}`}>
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`font-medium ${order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'text-gray-900' : 'text-gray-500'}`}>
                    Processing
                  </h3>
                  <p className="text-sm text-gray-500">Within 24 hours</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-red-600' : 'bg-gray-300'}`}>
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`font-medium ${order.status === 'shipped' || order.status === 'delivered' ? 'text-gray-900' : 'text-gray-500'}`}>
                    Shipped
                  </h3>
                  <p className="text-sm text-gray-500">2-3 business days</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${order.status === 'delivered' ? 'bg-red-600' : 'bg-gray-300'}`}>
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`font-medium ${order.status === 'delivered' ? 'text-gray-900' : 'text-gray-500'}`}>
                    Delivered
                  </h3>
                  <p className="text-sm text-gray-500">{getEstimatedDelivery()}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-center">
              <Badge className={`${getStatusColor(order.status)} border text-base px-4 py-2`}>
                {getStatusIcon(order.status)}
                <span className="ml-2 capitalize">{order.status}</span>
              </Badge>
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
                  {order.items.map((item, index) => (
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
                            {item.selectedVariants.map((variant, vIndex) => (
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
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{order.shippingAddress.phone}</span>
                      </div>
                      <div className="flex items-start space-x-2 mt-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p>{order.shippingAddress.street}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                          <p>{order.shippingAddress.zipCode}</p>
                          {order.shippingAddress.landmark && (
                            <p className="text-sm text-gray-600">
                              Landmark: {order.shippingAddress.landmark}
                            </p>
                          )}
                        </div>
                      </div>
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
                    className={order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}
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

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
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
                  <span>Total</span>
                  <span className="text-red-600">{formatPrice(order.totalAmount)}</span>
                </div>

                <div className="space-y-3 mt-6">
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <Package className="mr-2 h-4 w-4" />
                    Track Package
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Invoice
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-red-50 border border-red-200">
                  <h4 className="font-medium text-red-900 mb-2">Need Help?</h4>
                  <p className="text-sm text-red-800 mb-3">
                    Contact our support team for any questions about your order.
                  </p>
                  <div className="text-sm text-red-700">
                    <p>📞 +91 9876543210</p>
                    <p>📧 support@dtushop.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
