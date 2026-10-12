import mongoose, { Document, Schema } from 'mongoose';

export interface ISetting extends Document {
  key: string;
  storeName: string;
  supportEmail: string;
  currency: string;
  lowStockThreshold: number;
  allowRegistrations: boolean;
  maintenanceMode: boolean;
  orderNotifications: boolean;
  lowStockAlerts: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>({
  key: {
    type: String,
    unique: true,
    default: 'admin-settings',
  },
  storeName: {
    type: String,
    default: 'DTU Gift Shop',
    trim: true,
  },
  supportEmail: {
    type: String,
    default: '',
    trim: true,
    lowercase: true,
  },
  currency: {
    type: String,
    enum: ['INR'],
    default: 'INR',
  },
  lowStockThreshold: {
    type: Number,
    min: 0,
    default: 5,
  },
  allowRegistrations: {
    type: Boolean,
    default: true,
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  orderNotifications: {
    type: Boolean,
    default: true,
  },
  lowStockAlerts: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Setting || mongoose.model<ISetting>('Setting', settingSchema);
