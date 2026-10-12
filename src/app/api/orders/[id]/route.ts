// app/api/orders/[id]/route.ts - Fix TypeScript error
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Helper function to serialize order data
function serializeOrder(orderData: any) {
  const order = JSON.parse(JSON.stringify(orderData)); // Deep clone and remove Mongoose methods
  
  // Convert top-level ObjectId
  if (order._id) {
    order._id = order._id.toString();
  }
  
  // Convert user ObjectId if populated
  if (order.user && order.user._id) {
    order.user._id = order.user._id.toString();
  }
  
  // Convert nested items
  if (order.items && Array.isArray(order.items)) {
    order.items = order.items.map((item: any) => {
      // Define the serialized item with proper typing
      const serializedItem: any = {
        name: item.name || '',
        price: item.price || 0,
        quantity: item.quantity || 0,
        image: item.image || '',
        selectedVariants: item.selectedVariants || []
      };
      
      // Convert item _id if present
      if (item._id) {
        serializedItem._id = item._id.toString();
      }
      
      // Handle product field - convert ObjectId to string
      if (item.product) {
        if (typeof item.product === 'object' && item.product._id) {
          // If product is populated object
          serializedItem.product = {
            _id: item.product._id.toString(),
            name: item.product.name || '',
            price: item.product.price || 0,
            images: item.product.images || []
          };
        } else {
          // If product is just ObjectId
          serializedItem.product = item.product.toString();
        }
      }
      
      // Convert selectedVariants _ids if present
      if (serializedItem.selectedVariants && Array.isArray(serializedItem.selectedVariants)) {
        serializedItem.selectedVariants = serializedItem.selectedVariants.map((variant: any) => ({
          type: variant.type || '',
          value: variant.value || '',
          price: variant.price || 0,
          ...(variant._id && { _id: variant._id.toString() })
        }));
      }
      
      return serializedItem;
    });
  }
  
  return order;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    console.log('Fetching order:', id, 'for user:', session.user.id);

    await dbConnect();

    const orderData = await Order.findOne({
      _id: id,
      user: session.user.id
    }).lean(); // Use .lean() to get plain JavaScript object

    console.log('Found order:', !!orderData);

    if (!orderData) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Serialize the order data to remove Mongoose-specific properties
    const serializedOrder = serializeOrder(orderData);

    // Ensure all required fields have default values
    const order = {
      _id: serializedOrder._id,
      orderNumber: serializedOrder.orderNumber || '',
      items: serializedOrder.items || [],
      totalAmount: serializedOrder.totalAmount || 0,
      subtotal: serializedOrder.subtotal || 0,
      tax: serializedOrder.tax || 0,
      shipping: serializedOrder.shipping || 0,
      status: serializedOrder.status || 'pending',
      paymentStatus: serializedOrder.paymentStatus || 'pending',
      paymentMethod: serializedOrder.paymentMethod || 'cash_on_delivery',
      shippingAddress: serializedOrder.shippingAddress || {},
      notes: serializedOrder.notes || '',
      createdAt: serializedOrder.createdAt,
      updatedAt: serializedOrder.updatedAt
    };

    return NextResponse.json({
      order
    });

  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
