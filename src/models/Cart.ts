// models/Cart.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  selectedVariants?: {
    type: string;
    value: string;
    price?: number;
  }[];
}

export interface ICart extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
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

const cartSchema = new Schema<ICart>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total amount before saving
cartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => {
    const variantPrice = item.selectedVariants?.reduce((sum, variant) => sum + (variant.price || 0), 0) || 0;
    return total + ((item.price + variantPrice) * item.quantity);
  }, 0);
  next();
});

export default mongoose.models.Cart || mongoose.model<ICart>('Cart', cartSchema);
