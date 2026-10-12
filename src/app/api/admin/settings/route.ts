import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth/adminAuth';
import dbConnect from '@/lib/dbConnect';
import Setting from '@/models/Setting';

const defaults = {
  key: 'admin-settings',
  storeName: 'DTU Gift Shop',
  supportEmail: '',
  currency: 'INR',
  lowStockThreshold: 5,
  allowRegistrations: true,
  maintenanceMode: false,
  orderNotifications: true,
  lowStockAlerts: true,
};

export async function GET() {
  try {
    await checkAdminAuth();
    await dbConnect();

    const settings = await Setting.findOneAndUpdate(
      { key: 'admin-settings' },
      { $setOnInsert: defaults },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({ settings });
  } catch (error: any) {
    const status = error?.message?.includes('Authentication') ? 401 : error?.message?.includes('Admin') ? 403 : 500;
    return NextResponse.json({ message: error?.message || 'Failed to load settings' }, { status });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await checkAdminAuth();
    await dbConnect();

    const body = await request.json();
    const update = {
      storeName: String(body.storeName || 'DTU Gift Shop').trim(),
      supportEmail: String(body.supportEmail || '').trim().toLowerCase(),
      currency: 'INR',
      lowStockThreshold: Math.max(0, Number(body.lowStockThreshold) || 0),
      allowRegistrations: Boolean(body.allowRegistrations),
      maintenanceMode: Boolean(body.maintenanceMode),
      orderNotifications: Boolean(body.orderNotifications),
      lowStockAlerts: Boolean(body.lowStockAlerts),
    };

    if (!update.storeName) {
      return NextResponse.json({ message: 'Store name is required' }, { status: 400 });
    }

    if (update.supportEmail && !/^\S+@\S+\.\S+$/.test(update.supportEmail)) {
      return NextResponse.json({ message: 'Enter a valid support email' }, { status: 400 });
    }

    const settings = await Setting.findOneAndUpdate(
      { key: 'admin-settings' },
      { $set: update, $setOnInsert: { key: 'admin-settings' } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({ settings });
  } catch (error: any) {
    const status = error?.message?.includes('Authentication') ? 401 : error?.message?.includes('Admin') ? 403 : 500;
    return NextResponse.json({ message: error?.message || 'Failed to save settings' }, { status });
  }
}
