import mongoose, { Schema } from 'mongoose';
import { IQuestion } from '../types';
import { LocalQuestion } from '../services/localDb';

const QuestionSchema = new Schema<IQuestion>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    alignerSetId: {
      type: Schema.Types.ObjectId,
      ref: 'AlignerSet',
      default: null,
    },
    journalEntryId: {
      type: Schema.Types.ObjectId,
      ref: 'JournalEntry',
      default: null,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    answerNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

QuestionSchema.index({ userId: 1, isCompleted: 1 });

const MongooseQuestionModel = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

const QuestionProxy = new Proxy(MongooseQuestionModel, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    return (LocalQuestion as any)[prop];
  },
});

export default QuestionProxy as unknown as typeof MongooseQuestionModel;
