import mongoose, { Schema } from 'mongoose';
import { INotification } from '../types';
import { LocalNotification } from '../services/localDb';

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'appointment_reminder',
        'aligner_change',
        'aligner_overdue',
        'wear_time',
        'data_warning',
        'system',
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedModel: {
      type: String,
      enum: ['AlignerSet', 'Appointment', 'JournalEntry'],
      default: null,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    scheduledFor: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'delivered', 'failed', 'cancelled'],
      default: 'delivered',
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    deduplicationKey: {
      type: String,
      index: true,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    actionUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const MongooseNotificationModel = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

const NotificationProxy = new Proxy(MongooseNotificationModel, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    return (LocalNotification as any)[prop];
  },
});

export default NotificationProxy as unknown as typeof MongooseNotificationModel;
