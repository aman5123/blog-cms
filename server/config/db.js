import mongoose from 'mongoose';

export let isInMemoryFallback = false;

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cms_blog';
    mongoose.set('strictQuery', false);
    
    // Set a short connection timeout so fallback triggers fast if local Mongo is off
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 2500
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`MongoDB Connection Warning (${error.message}). Activating In-Memory Persistence Fallback...`);
    isInMemoryFallback = true;
    return false;
  }
};
