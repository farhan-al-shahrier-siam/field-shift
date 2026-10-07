import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const isPlaceholderUri = !MONGODB_URI || 
  MONGODB_URI.includes('username:password') || 
  MONGODB_URI.includes('cluster.mongodb.net');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (isPlaceholderUri) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection error:', e);
    return null;
  }

  return cached.conn;
}

export default connectToDatabase;
