// lib/cloudinary.ts - Enhanced with error handling
import { v2 as cloudinary } from 'cloudinary';

// Validate environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Missing Cloudinary environment variables:', {
    cloudName: !!cloudName,
    apiKey: !!apiKey,
    apiSecret: !!apiSecret
  });
  throw new Error('Cloudinary configuration is incomplete. Please check your environment variables.');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true, // Force HTTPS
});

// Test configuration
export const testCloudinaryConfig = () => {
  console.log('Cloudinary Config:', {
    cloud_name: cloudinary.config().cloud_name,
    api_key: cloudinary.config().api_key ? 'Set' : 'Missing',
    api_secret: cloudinary.config().api_secret ? 'Set' : 'Missing',
  });
};

export default cloudinary;
