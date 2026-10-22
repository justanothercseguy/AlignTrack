import mongoose, { Schema } from 'mongoose';
import { IPushSubscription } from '../types';
import { LocalPushSubscription } from '../services/localDb';

const PushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscription: {
      endpoint: { type: String, required: true },
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
      },
    },
    userAgent: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

PushSubscriptionSchema.index({ userId: 1, 'subscription.endpoint': 1 }, { unique: true });

const MongoosePushSubscriptionModel = mongoose.models.PushSubscription || mongoose.model<IPushSubscription>('PushSubscription', PushSubscriptionSchema);

const PushSubscriptionProxy = new Proxy(MongoosePushSubscriptionModel, {
  get(target, prop, receiver) {
    if (mongoose.connection.readyState === 1) {
      return Reflect.get(target, prop, receiver);
    }
    return (LocalPushSubscription as any)[prop];
  },
});

export default PushSubscriptionProxy as unknown as typeof MongoosePushSubscriptionModel;
