// models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'admin';
  collegeId?: string;
  department?: string;
  year?: number;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  wishlist: mongoose.Types.ObjectId[]; // Add this field


  lastLogin?: Date;
  // emailVerified?: boolean;
  adminPermissions?: string[]; // For granular admin permissions
  // createdBy?: string; // Track who created the user (for admin-created accounts)
  // notes?: string; // Admin notes about the user



  image?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const addressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, default: 'India' }
});

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [30, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      // Password required only for credential-based accounts
      return !this.image; // If no image (Google OAuth), password is required
    },
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  collegeId: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    min: 1,
    max: 4
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  adminPermissions: {
    type: [String],
    enum: ['users', 'products', 'orders', 'categories', 'analytics', 'settings'],
    default: []
  },
  lastLogin: {
    type: Date,
    default: null
  },
  wishlist: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],







  
  address: addressSchema,
  image: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// userSchema.index({ email: 1 });
// userSchema.index({ collegeId: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
