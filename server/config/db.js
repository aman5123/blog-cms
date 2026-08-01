import mongoose from 'mongoose';

export let isInMemoryFallback = false;

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cms_blog';
    mongoose.set('strictQuery', false);
    
    const timeout = process.env.MONGODB_URI ? 10000 : 2500;
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: timeout
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`MongoDB Connection Warning (${error.message}). Activating In-Memory Persistence Fallback...`);
    isInMemoryFallback = true;
    return false;
  }
};
