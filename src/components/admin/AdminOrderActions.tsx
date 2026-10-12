// components/admin/AdminOrderActions.tsx - Fixed hydration issues
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  Edit,
  Save,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminOrderActionsProps {
  order: {
    _id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    subtotal: number;
    tax: number;
    shipping: number;
    createdAt: string;
    updatedAt: string;
    items: any[];
  };
}

export default function AdminOrderActions({ order }: AdminOrderActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(order.status);
  const [newPaymentStatus, setNewPaymentStatus] = useState(order.paymentStatus);
  const [adminNotes, setAdminNotes] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Fix hydration by ensuring client-side rendering for dates
  useEffect(() => {
    setIsClient(true);
  }, []);

  const updateOrderStatus = async () => {
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/admin/orders/${order._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          paymentStatus: newPaymentStatus,
          adminNotes 
        }),
      });

      if (response.ok) {
        toast.success('Order updated successfully');
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update order');
      }
    } catch (error) {
      toast.error('Error updating order');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  // Safe date formatting function
  const formatDate = (dateString: string) => {
    if (!isClient) return 'Loading...';
    
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Status:</span>
              <Badge className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Payment Status:</span>
              <Badge className={order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {order.paymentStatus}
              </Badge>
            </div>
            
            <Separator />
            
            {/* Fix hydration issue with suppressHydrationWarning */}
            <div className="text-sm text-gray-600">
              <p suppressHydrationWarning>
                <strong>Created:</strong> {formatDate(order.createdAt)}
              </p>
              <p suppressHydrationWarning>
                <strong>Updated:</strong> {formatDate(order.updatedAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Status */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center">
            <Edit className="mr-2 h-5 w-5 text-red-600" />
            Update Order
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Order Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                placeholder="Add internal notes about this order..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
            
            <Button 
              onClick={updateOrderStatus}
              disabled={isUpdating}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Order
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Items:</span>
              <span>{order.items.length}</span>
            </div>
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
            <div className="flex justify-between font-medium text-base">
              <span>Total:</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
