import mongoose, { Schema } from 'mongoose';
import { IAppointment } from '../types';
import { LocalAppointment } from '../services/localDb';

const ReminderConfigSchema = new Schema(
  {
    oneDayBefore: { type: Boolean, default: true },
    dayOf: { type: Boolean, default: false },
    customMinutesBefore: { type: Number, default: null },
    reminderTime: { type: String, default: '09:00' },
  },
  { _id: false }
);

const AppointmentSchema = new Schema<IAppointment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    time: {
      type: String,
      default: '',
    },
    timezone: {
      type: String,
      required: true,
      default: 'Asia/Kolkata',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    questionsToAsk: {
      type: [String],
      default: [],
    },
    issuesToDiscuss: [
      {
        type: Schema.Types.ObjectId,
        ref: 'JournalEntry',
      },
    ],
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'cancelled', 'rescheduled'],
      default: 'upcoming',
      index: true,
    },
    reminderConfig: {
      type: ReminderConfigSchema,
      default: () => ({}),
    },
    postAppointmentNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

AppointmentSchema.index({ userId: 1, date: 1, status: 1 });

const MongooseAppointmentModel = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);

const AppointmentProxy = new Proxy(MongooseAppointmentModel, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    return (LocalAppointment as any)[prop];
  },
});

export default AppointmentProxy as unknown as typeof MongooseAppointmentModel;
