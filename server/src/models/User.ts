import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';
import { LocalUser } from '../services/localDb';

const PhaseConfigSchema = new Schema({
  name: { type: String, required: true },
  startSet: { type: Number, required: true },
  endSet: { type: Number, default: null },
  defaultDurationDays: { type: Number, required: true, default: 10 },
  defaultWearTimeTarget: { type: Number, required: true, default: 18 },
}, { _id: false });

const NotificationPreferencesSchema = new Schema({
  appointmentReminder1DayBefore: { type: Boolean, default: true },
  appointmentReminderDayOf: { type: Boolean, default: false },
  appointmentReminderTime: { type: String, default: '09:00' },
  alignerReminder3DaysBefore: { type: Boolean, default: false },
  alignerReminder2DaysBefore: { type: Boolean, default: false },
  alignerReminder1DayBefore: { type: Boolean, default: true },
  alignerReminderOnDay: { type: Boolean, default: false },
  alignerOverdueReminder: { type: Boolean, default: true },
  wearTimeReminder: { type: Boolean, default: false },
  wearTimeReminderInterval: { type: Number, default: 4 },
}, { _id: false });

const TreatmentSettingsSchema = new Schema({
  phases: {
    type: [PhaseConfigSchema],
    default: [
      { name: 'Phase A', startSet: 1, endSet: 5, defaultDurationDays: 10, defaultWearTimeTarget: 18 },
      { name: 'Phase B', startSet: 6, endSet: null, defaultDurationDays: 7, defaultWearTimeTarget: 20 },
    ],
  },
  schedulingMode: { type: String, enum: ['actual', 'planned'], default: 'actual' },
}, { _id: false });

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    displayName: {
      type: String,
      default: '',
      trim: true,
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    notificationPreferences: {
      type: NotificationPreferencesSchema,
      default: () => ({}),
    },
    treatmentSettings: {
      type: TreatmentSettingsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const MongooseUserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

const UserProxy = new Proxy(MongooseUserModel, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    return (LocalUser as any)[prop];
  },
});

export default UserProxy as unknown as typeof MongooseUserModel;
