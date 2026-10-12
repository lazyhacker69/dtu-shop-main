// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Cart from '@/models/Cart';
import Order from '@/models/Order';
import Review from '@/models/Review';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await dbConnect();
        
        const connectionInfo = {
            state: mongoose.connection.readyState,
            database: mongoose.connection.name,
            host: mongoose.connection.host,
            port: mongoose.connection.port
        };
        
        // Count documents in each collection
        const counts = {
            users: await User.countDocuments(),
            categories: await Category.countDocuments(),
            products: await Product.countDocuments(),
            carts: await Cart.countDocuments(),
            orders: await Order.countDocuments(),
            reviews: await Review.countDocuments()
        };
        
        // List all collections
        const collections = await mongoose.connection.db?.listCollections().toArray();
        const collectionNames = collections?.map(col => col.name);
        
        return NextResponse.json({
            success: true,
            message: 'Database connection successful',
            connectionInfo,
            documentCounts: counts,
            collections: collectionNames,
            modelsRegistered: Object.keys(mongoose.models)
        });
        
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
