// scripts/createAdmin.ts
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth/password';

async function createAdmin() {
  try {
    await dbConnect();
    
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'demoadmin123';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    const hashedPassword = await hashPassword(adminPassword);
    
    const admin = await User.create({
      name: 'System Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      adminPermissions: ['users', 'products', 'orders', 'categories', 'analytics', 'settings'],
      isActive: true,
    });
    
    console.log('Admin user created successfully:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('ID:', admin._id);
    
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    process.exit(0);
  }
}

createAdmin();
