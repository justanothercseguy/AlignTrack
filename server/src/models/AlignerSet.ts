import mongoose, { Schema } from 'mongoose';
import { IAlignerSet } from '../types';
import { LocalAlignerSet } from '../services/localDb';

const AlignerReminderPreferencesSchema = new Schema(
  {
    reminder3DaysBefore: { type: Boolean, default: false },
    reminder2DaysBefore: { type: Boolean, default: false },
    reminder1DayBefore: { type: Boolean, default: true },
    reminderOnDay: { type: Boolean, default: false },
  },
  { _id: false }
);

const AlignerSetSchema = new Schema<IAlignerSet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    setNumber: {
      type: Number,
      required: true,
    },
    label: {
      type: String,
      trim: true,
    },
    plannedStartDate: {
      type: String,
    },
    plannedStartTime: {
      type: String,
    },
    actualStartDate: {
      type: String,
    },
    actualStartTime: {
      type: String,
    },
    plannedDurationDays: {
      type: Number,
      required: true,
      min: 1,
      max: 90,
      default: 10,
    },
    plannedChangeDate: {
      type: String,
    },
    plannedChangeTime: {
      type: String,
    },
    actualChangeDate: {
      type: String,
    },
    actualChangeTime: {
      type: String,
    },
    wearTimeTargetOverride: {
      type: Number,
      min: 1,
      max: 24,
      default: null,
    },
    status: {
      type: String,
      enum: ['planned', 'current', 'completed', 'paused', 'cancelled'],
      default: 'planned',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    reminderPreferences: {
      type: AlignerReminderPreferencesSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

AlignerSetSchema.index({ userId: 1, setNumber: 1 }, { unique: true });

const MongooseAlignerSetModel = mongoose.models.AlignerSet || mongoose.model<IAlignerSet>('AlignerSet', AlignerSetSchema);

const AlignerSetProxy = new Proxy(MongooseAlignerSetModel, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    return (LocalAlignerSet as any)[prop];
  },
});

export default AlignerSetProxy as unknown as typeof MongooseAlignerSetModel;
