import client from './client';
import { NotificationItem } from '../types';

export const listNotificationsApi = async (params?: { unreadOnly?: boolean; type?: string }): Promise<{ notifications: NotificationItem[]; unreadCount: number }> => {
  const res = await client.get('/notifications', { params });
  return res.data.data;
};

export const markNotificationReadApi = async (id: string): Promise<NotificationItem> => {
  const res = await client.put(`/notifications/${id}/read`);
  return res.data.data;
};

export const markAllNotificationsReadApi = async () => {
  const res = await client.put('/notifications/read-all');
  return res.data;
};

export const deleteNotificationApi = async (id: string) => {
  const res = await client.delete(`/notifications/${id}`);
  return res.data;
};

export const registerPushSubscriptionApi = async (data: { subscription: any; userAgent?: string }) => {
  const res = await client.post('/notifications/push-subscription', data);
  return res.data.data;
};

export const getPushStatusApi = async (): Promise<{ supported: boolean; hasSubscription: boolean }> => {
  const res = await client.get('/notifications/push-status');
  return res.data.data;
};
