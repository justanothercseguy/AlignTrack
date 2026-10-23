import app from '../src/app';
import { connectDatabase } from '../src/config/database';

connectDatabase().catch((err) => {
  console.warn('Database connection warning in serverless:', err);
});

export default app;
