import mongoose, { Schema } from 'mongoose';
import { IJournalEntry } from '../types';
import { LocalJournalEntry } from '../services/localDb';

const AttachmentSchema = new Schema(
  {
    filename: { type: String, required: true },
    path: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const JournalEntrySchema = new Schema<IJournalEntry>(
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
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
      index: true,
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
    category: {
      type: String,
      enum: [
        'pain_pressure',
        'fit_concern',
        'gum_irritation',
        'sharp_edge',
        'attachment_concern',
        'speech_difficulty',
        'eating_difficulty',
        'cleaning_difficulty',
        'lost_damaged',
        'other',
      ],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      default: 'Mild',
    },
    affectedArea: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: String,
    },
    resolutionDate: {
      type: String,
      default: null,
    },
    isOngoing: {
      type: Boolean,
      default: true,
      index: true,
    },
    needsDiscussion: {
      type: Boolean,
      default: false,
      index: true,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

JournalEntrySchema.index({ userId: 1, date: -1 });

const MongooseJournalEntryModel = mongoose.models.JournalEntry || mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);

const JournalEntryProxy = new Proxy(MongooseJournalEntryModel, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    return (LocalJournalEntry as any)[prop];
  },
});

export default JournalEntryProxy as unknown as typeof MongooseJournalEntryModel;
