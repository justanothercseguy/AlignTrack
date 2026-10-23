import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { corsOptions } from './config/cors';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

// Import all route files
import authRoutes from './routes/auth';
import alignerSetRoutes from './routes/alignerSets';
import wearSessionRoutes from './routes/wearSessions';
import appointmentRoutes from './routes/appointments';
import journalRoutes from './routes/journal';
import questionRoutes from './routes/questions';
import notificationRoutes from './routes/notifications';
import calendarRoutes from './routes/calendar';
import reportRoutes from './routes/reports';
import settingsRoutes from './routes/settings';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check & root status
app.get('/', (req, res) => {
  res.json({ success: true, message: 'AlignTrack Backend API is live and running!' });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/db-status', async (req, res) => {
  let connectionError = null;
  if (mongoose.connection.readyState !== 1 && process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 4000,
      });
    } catch (e: any) {
      connectionError = e.message || String(e);
    }
  }
  res.json({
    readyState: mongoose.connection.readyState, // 1 = connected, 0 = disconnected
    isConnected: mongoose.connection.readyState === 1,
    hasMongoUri: !!process.env.MONGODB_URI,
    mongoUriPrefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.split('@')[1] || 'hidden' : 'NOT_SET',
    dbName: mongoose.connection.name || null,
    error: connectionError
  });
});

// Routes (supports both /api/xxx and /xxx)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/aligner-sets', alignerSetRoutes);
app.use('/aligner-sets', alignerSetRoutes);

app.use('/api/wear-sessions', wearSessionRoutes);
app.use('/wear-sessions', wearSessionRoutes);

app.use('/api/appointments', appointmentRoutes);
app.use('/appointments', appointmentRoutes);

app.use('/api/journal', journalRoutes);
app.use('/journal', journalRoutes);

app.use('/api/questions', questionRoutes);
app.use('/questions', questionRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);

app.use('/api/calendar', calendarRoutes);
app.use('/calendar', calendarRoutes);

app.use('/api/reports', reportRoutes);
app.use('/reports', reportRoutes);

app.use('/api/settings', settingsRoutes);
app.use('/settings', settingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

export default app;
