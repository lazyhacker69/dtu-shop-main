// models/Product.ts
import mongoose, { Document, Schema } from 'mongoose';
import './Category';

export interface IProductVariant {
  type: string; // e.g., 'size', 'color'
  value: string; // e.g., 'M', 'Blue'
  price?: number; // Additional price for this variant
  stock?: number; // Stock for this specific variant
}

export interface IProduct extends Document {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  category: mongoose.Types.ObjectId;
  images: string[];
  tags: string[];
  variants: IProductVariant[];
  quantity: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema({
  type: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number,
    min: 0,
    default: 0
  }
});

// const inventorySchema = new Schema({
//   quantity: {
//     type: Number,
//     required: true,
//     min: 0,
//     default: 0
//   },
//   lowStockThreshold: {
//     type: Number,
//     default: 5
//   },
//   trackQuantity: {
//     type: Boolean,
//     default: true
//   }
// });

// const dimensionsSchema = new Schema({
//   length: { type: Number, required: true },
//   width: { type: Number, required: true },
//   height: { type: Number, required: true }
// });

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  // slug: {
  //   type: String,
  //   required: true, 
  //   unique: true,
  //   lowercase: true
  // },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  images: [{
    type: String,
    required: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  variants: [variantSchema],
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
//   specifications: {
//     type: Map,
//     of: String
//   },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
//   weight: {
//     type: Number,
//     min: 0
//   },
//   dimensions: dimensionsSchema,
//   seoTitle: {
//     type: String,
//     maxlength: [60, 'SEO title cannot exceed 60 characters']
//   },
//   seoDescription: {
//     type: String,
//     maxlength: [160, 'SEO description cannot exceed 160 characters']
//   }
}, {
  timestamps: true
});

// Indexes for better query performance
// productSchema.index({ slug: 1 });
// productSchema.index({ category: 1, isActive: 1 });
// productSchema.index({ tags: 1 });
// productSchema.index({ price: 1 });
// productSchema.index({ isFeatured: 1, isActive: 1 });
// productSchema.index({ name: 'text', description: 'text', tags: 'text' });



export default mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
