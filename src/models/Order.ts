// models/Order.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
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

export interface IOrder extends Document {
  _id: string;
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cash_on_delivery' | 'upi' | 'card' | 'net_banking';
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
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    required: true
  },
  selectedVariants: [{
    type: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      default: 0
    }
  }]
});

const orderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    unique: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  shipping: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash_on_delivery', 'upi', 'card', 'net_banking'],
    required: true
  },
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    landmark: String
  },
  notes: String
}, {
  timestamps: true
});

// Enhanced pre-save hook
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    let orderNumber: string;
    let isUnique = false;
    let attempts = 0;
    
    do {
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      orderNumber = `DTU${timestamp.slice(-6)}${random}`;
      
      // Check if this order number already exists
      const existingOrder = await mongoose.models.Order.findOne({ orderNumber });
      isUnique = !existingOrder;
      attempts++;
      
      if (attempts > 10) {
        return next(new Error('Failed to generate unique order number'));
      }
    } while (!isUnique);
    
    this.orderNumber = orderNumber;
  }
  next();
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
