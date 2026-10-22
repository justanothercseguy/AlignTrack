import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { startReminderScheduler } from './services/reminderScheduler';
import { initializeWebPush } from './services/pushNotification';

const start = async (): Promise<void> => {
  try {
    await connectDatabase();
    console.log('Connected to MongoDB');

    initializeWebPush();
    startReminderScheduler();

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
