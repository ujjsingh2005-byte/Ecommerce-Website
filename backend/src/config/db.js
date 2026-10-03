import mongoose from 'mongoose';

const FALLBACK_MONGODB_URI = 'mongodb+srv://ujjsingh2005_db_user:iFGANAVdFX9rTeDB@cluster0.so16r4m.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

export const connectDB = async () => {
  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  let uri = process.env.MONGODB_URI;
  if (!uri || (process.env.NODE_ENV === 'production' && uri.includes('localhost'))) {
    uri = FALLBACK_MONGODB_URI;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log(`MongoDB Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    // If custom URI failed and differs from fallback, try fallback directly
    if (uri !== FALLBACK_MONGODB_URI) {
      try {
        console.log('Attempting fallback connection to MongoDB Atlas...');
        const conn = await mongoose.connect(FALLBACK_MONGODB_URI, {
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
        });
        console.log(`Fallback connection succeeded to host: ${conn.connection.host}`);
        return conn;
      } catch (fallbackError) {
        console.error(`Fallback Atlas connection error: ${fallbackError.message}`);
      }
    }
    return null;
  }
};


