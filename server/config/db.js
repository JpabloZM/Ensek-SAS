// Database connection configuration
import mongoose from 'mongoose';

// Flag to determine if we're using MongoDB or MockDB
let usingMockDB = false;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ensek', {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Falling back to Mock Database for development');
    usingMockDB = true;
    // Don't exit process, allow the app to use MockDB instead
    return null;
  }
};

export const isUsingMockDB = () => usingMockDB;
