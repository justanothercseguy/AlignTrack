import webpush from 'web-push';
import env from '../config/env';
import PushSubscriptionModel from '../models/PushSubscription';
import NotificationModel from '../models/Notification';

let isWebPushConfigured = false;

export const initializeWebPush = (): void => {
  if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
    try {
      webpush.setVapidDetails(
        env.VAPID_EMAIL,
        env.VAPID_PUBLIC_KEY,
        env.VAPID_PRIVATE_KEY
      );
      isWebPushConfigured = true;
    } catch (err) {
      console.warn('Failed to configure web-push VAPID details:', err);
    }
  }
};

initializeWebPush();


export const sendPushNotification = async (
  userId: string,
  payload: { title: string; message: string; actionUrl?: string; notificationId?: string }
): Promise<void> => {
  if (!isWebPushConfigured) {
    return;
  }

  const subscriptions = await PushSubscriptionModel.find({ userId, isActive: true });
  if (!subscriptions || subscriptions.length === 0) {
    return;
  }

  const stringified = JSON.stringify({
    title: payload.title,
    body: payload.message,
    data: {
      url: payload.actionUrl || '/',
      notificationId: payload.notificationId,
    },
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.subscription.endpoint,
          keys: {
            p256dh: sub.subscription.keys.p256dh,
            auth: sub.subscription.keys.auth,
          },
        },
        stringified
      );
    } catch (error: any) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        // Subscription is no longer valid, deactivate it
        sub.isActive = false;
        await sub.save();
      }
    }
  }
};

export const isPushSupported = (): boolean => isWebPushConfigured;
