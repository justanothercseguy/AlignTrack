import app from '../src/app';
import { connectDatabase } from '../src/config/database';

export default async function handler(req: any, res: any) {
  try {
    await connectDatabase();
  } catch (err) {
    console.error('Database connection error in serverless handler:', err);
  }
  return app(req, res);
}

