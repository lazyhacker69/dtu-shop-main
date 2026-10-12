// app/api/orders/route.ts - Fixed serialization
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

// Helper function to serialize orders array
function serializeOrders(ordersData: any[]) {
  return ordersData.map((orderData: any) => {
    const order = JSON.parse(JSON.stringify(orderData)); // Deep clone
    
    // Convert ObjectIds to strings
    if (order._id) {
      order._id = order._id.toString();
    }
    
    if (order.user) {
      order.user = order.user.toString();
    }
    
    // Serialize items
    if (order.items && Array.isArray(order.items)) {
      order.items = order.items.map((item: any) => ({
        _id: item._id ? item._id.toString() : undefined,
        name: item.name || '',
        price: item.price || 0,
        quantity: item.quantity || 0,
        image: item.image || '',
        product: item.product ? item.product.toString() : '',
        selectedVariants: (item.selectedVariants || []).map((variant: any) => ({
          type: variant.type || '',
          value: variant.value || '',
          price: variant.price || 0
        }))
      }));
    }
    
    return {
      _id: order._id,
      orderNumber: order.orderNumber || '',
      items: order.items || [],
      totalAmount: order.totalAmount || 0,
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      shipping: order.shipping || 0,
      status: order.status || 'pending',
      paymentStatus: order.paymentStatus || 'pending',
      paymentMethod: order.paymentMethod || 'cash_on_delivery',
      shippingAddress: order.shippingAddress || {},
      notes: order.notes || '',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    console.log('Fetching orders for user:', session.user.id);

    const ordersData = await Order.find({ user: session.user.id })
      .sort({ createdAt: -1 })
      .lean(); // Use .lean() to get plain JavaScript objects

    console.log('Found orders:', ordersData.length);

    // Serialize the orders data
    const orders = serializeOrders(ordersData);

    return NextResponse.json({
      orders
    });

  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
