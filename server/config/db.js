import mongoose from 'mongoose';
import { getConfig } from './env.js';

export async function connectDB() {
  try {
    const { mongoUri } = getConfig();
    if (!mongoUri) throw new Error('MONGODB_URI must be configured');
    console.log('[Database] Connecting to MongoDB...');
    
    // Mongoose standard connection options
    const options = {
      autoIndex: true,
    };

    mongoose.connection.on('connected', () => {
      console.log('[Database] MongoDB connection established successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[Database] MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB disconnected');
    });

    await mongoose.connect(mongoUri, options);
  } catch (err) {
    console.error('[Database] Critical error initializing database connection:', err);
    process.exit(1);
  }
}
