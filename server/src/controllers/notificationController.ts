import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import Notification from '../models/Notification';
import PushSubscription from '../models/PushSubscription';
import { isPushSupported } from '../services/pushNotification';
import { sendSuccess } from '../utils/response';
import { NotFoundError } from '../utils/errors';

export const listNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { unreadOnly, type, limit = 50 } = req.query;

    const filter: any = { userId };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }
    if (type) {
      filter.type = type;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    sendSuccess(res, {
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    sendSuccess(res, notification, 'Notification marked read');
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true, readAt: new Date() } });

    sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    sendSuccess(res, null, 'Notification deleted');
  } catch (error) {
    next(error);
  }
};

export const registerPushSubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { subscription, userAgent } = req.body;

    const updated = await PushSubscription.findOneAndUpdate(
      { userId, 'subscription.endpoint': subscription.endpoint },
      {
        $set: {
          userId,
          subscription,
          userAgent: userAgent || '',
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );

    sendSuccess(res, updated, 'Push subscription registered');
  } catch (error) {
    next(error);
  }
};

export const removePushSubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { endpoint } = req.body;

    await PushSubscription.findOneAndUpdate(
      { userId, 'subscription.endpoint': endpoint },
      { $set: { isActive: false } }
    );

    sendSuccess(res, null, 'Push subscription removed');
  } catch (error) {
    next(error);
  }
};

export const getPushStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const hasActiveSubscription = await PushSubscription.exists({ userId, isActive: true });
    const supported = isPushSupported();

    sendSuccess(res, {
      supported,
      hasSubscription: !!hasActiveSubscription,
    });
  } catch (error) {
    next(error);
  }
};
