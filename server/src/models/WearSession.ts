import mongoose, { Schema } from 'mongoose';
import { IWearSession } from '../types';
import { LocalWearSession } from '../services/localDb';

const SessionCorrectionSchema = new Schema(
  {
    field: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    correctedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const WearSessionSchema = new Schema<IWearSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    alignerSetId: {
      type: Schema.Types.ObjectId,
      ref: 'AlignerSet',
      default: null,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
    timezone: {
      type: String,
      required: true,
      default: 'Asia/Kolkata',
    },
    source: {
      type: String,
      enum: ['timer', 'manual'],
      default: 'timer',
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
    corrections: {
      type: [SessionCorrectionSchema],
      default: [],
    },
    flaggedForReview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

WearSessionSchema.index({ userId: 1, startTime: -1 });
WearSessionSchema.index({ userId: 1, isActive: 1 });

const MongooseWearSessionModel = mongoose.models.WearSession || mongoose.model<IWearSession>('WearSession', WearSessionSchema);

const WearSessionProxy = new Proxy(MongooseWearSessionModel, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    return (LocalWearSession as any)[prop];
  },
});

export default WearSessionProxy as unknown as typeof MongooseWearSessionModel;
