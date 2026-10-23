import mongoose from 'mongoose';
import env from './env';
import { loadDb } from '../services/localDb';

export const connectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  try {
    // Attempt connecting with 5s timeout
    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.warn(
      'Notice: Local MongoDB service not detected on localhost:27017.\n' +
      'Automatically activating built-in persistent local database (server/data/db.json).\n' +
      'All features, authentication, wear time, and records will persist locally without requiring Docker or MongoDB installation!'
    );
    loadDb();
  }
};

export default connectDatabase;
