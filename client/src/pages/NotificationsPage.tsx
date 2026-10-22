import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import {
  listNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
  getPushStatusApi,
  registerPushSubscriptionApi,
} from '../api/notifications';
import { NotificationItem } from '../types';
import { formatDate } from '../utils/dates';
import { useApp } from '../contexts/AppContext';
import { Bell, CheckCheck, Trash2, CalendarCheck, Layers, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const NotificationsPage: React.FC = () => {
  const { refreshAll } = useApp();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [pushStatus, setPushStatus] = useState<{ supported: boolean; hasSubscription: boolean }>({
    supported: false,
    hasSubscription: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    try {
      setIsLoading(true);
      const [data, push] = await Promise.all([
        listNotificationsApi({ unreadOnly }),
        getPushStatusApi(),
      ]);
      setNotifications(data.notifications);
      setPushStatus(push);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [unreadOnly]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationReadApi(id);
      await fetchNotifs();
      await refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadApi();
      toast.success('All notifications marked as read');
      await fetchNotifs();
      await refreshAll();
    } catch (err) {
      toast.error('Failed to mark all read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotificationApi(id);
      await fetchNotifs();
      await refreshAll();
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const handleRequestPushPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast.success('Automatic notifications enabled! 🔔');
    } else {
      toast.error('Notification permission was not granted');
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'appointment_reminder':
        return <CalendarCheck className="text-[#DE350B]" size={18} />;
      case 'aligner_change':
        return <Layers className="text-[#7775E8]" size={18} />;
      case 'aligner_overdue':
        return <AlertCircle className="text-[#BF2600]" size={18} />;
      default:
        return <Bell className="text-[#9B8AFB]" size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#292747]">Notification Center</h2>
          <p className="text-xs text-[#8885A5]">
            Appointment reminders, aligner switch alerts, and schedule changes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRequestPushPermission}>
            <Bell size={14} className="mr-1.5" /> Enable Browser Push
          </Button>
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck size={14} className="mr-1.5" /> Mark All Read
          </Button>
        </div>
      </div>

      {/* Filter tab */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setUnreadOnly(false)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            !unreadOnly
              ? 'bg-[#7775E8] text-white shadow-sm'
              : 'bg-white border border-[#E9E3FF] text-[#8885A5]'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setUnreadOnly(true)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            unreadOnly
              ? 'bg-[#7775E8] text-white shadow-sm'
              : 'bg-white border border-[#E9E3FF] text-[#8885A5]'
          }`}
        >
          Unread Only
        </button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={28} />}
          title="No notifications"
          description="You're all caught up! You'll receive alerts here 1 day before appointments and planned aligner changes."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <Card
              key={item._id}
              className={`p-4 transition-all duration-200 ${
                !item.isRead ? 'border-l-4 border-l-[#9B8AFB] bg-gradient-to-r from-[#F8F7FF] to-white' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#E9E3FF]/60 flex items-center justify-center shrink-0 mt-0.5">
                    {getIconForType(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-bold text-sm text-[#292747]">{item.title}</h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#9B8AFB]" />
                      )}
                    </div>
                    <p className="text-xs text-[#8885A5] leading-relaxed mb-2">{item.message}</p>
                    <span className="text-[10px] text-[#8885A5]/80 font-medium">
                      {formatDate(item.createdAt, 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.actionUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleMarkRead(item._id);
                        navigate(item.actionUrl!);
                      }}
                      className="text-xs text-[#7775E8]"
                    >
                      <ArrowRight size={14} />
                    </Button>
                  )}
                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkRead(item._id)}
                      className="text-xs text-[#7775E8] hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 text-[#8885A5] hover:text-[#D32F2F] rounded-lg"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
