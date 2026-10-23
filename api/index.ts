import app from '../server/src/app';
import { connectDatabase } from '../server/src/config/database';

// Connect to database on serverless invocation
connectDatabase().catch((err) => {
  console.warn('Database initialization notice in serverless:', err);
});

export default app;
