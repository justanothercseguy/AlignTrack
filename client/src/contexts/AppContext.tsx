import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AlignerSet, WearSession, DailyWearSummary } from '../types';
import { getActiveWearSessionApi, getDailyWearSummaryApi, startWearSessionApi, stopWearSessionApi } from '../api/wearSessions';
import { updateWearTimeSettingsApi } from '../api/settings';
import { listAlignerSetsApi } from '../api/alignerSets';
import { listNotificationsApi } from '../api/notifications';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface AppContextType {
  activeSession: WearSession | null;
  dailySummary: DailyWearSummary | null;
  currentSet: AlignerSet | null;
  unreadCount: number;
  liveElapsedMinutes: number;
  isStartingSession: boolean;
  isStoppingSession: boolean;
  startSession: (customStartTime?: string) => Promise<void>;
  stopSession: (customEndTime?: string, customStartTime?: string) => Promise<void>;
  updateDailyTarget: (hours: number) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, refreshUser } = useAuth();
  const [activeSession, setActiveSession] = useState<WearSession | null>(null);
  const [dailySummary, setDailySummary] = useState<DailyWearSummary | null>(null);
  const [currentSet, setCurrentSet] = useState<AlignerSet | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [liveElapsedMinutes, setLiveElapsedMinutes] = useState<number>(0);
  const [isStartingSession, setIsStartingSession] = useState<boolean>(false);
  const [isStoppingSession, setIsStoppingSession] = useState<boolean>(false);

  const refreshAll = useCallback(async () => {
    if (!user) return;
    try {
      const [activeRes, summaryRes, setsRes, notifsRes] = await Promise.all([
        getActiveWearSessionApi(),
        getDailyWearSummaryApi(),
        listAlignerSetsApi('current'),
        listNotificationsApi({ unreadOnly: true }),
      ]);

      if (activeRes) {
        setActiveSession(activeRes);
        localStorage.setItem(
          'aligntrack_active_session',
          JSON.stringify({
            _id: activeRes._id,
            startTime: activeRes.startTime,
            alignerSetId: activeRes.alignerSetId,
          })
        );
      } else {
        // Fallback: check if an active session was cached locally in case server restarted
        const saved = localStorage.getItem('aligntrack_active_session');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const diffHours = (new Date().getTime() - new Date(parsed.startTime).getTime()) / (1000 * 60 * 60);
            if (diffHours < 24) {
              setActiveSession({
                _id: parsed._id || 'temp-local',
                userId: user.id,
                startTime: parsed.startTime,
                timezone: user.timezone || 'Asia/Kolkata',
                source: 'timer',
                isActive: true,
              } as WearSession);
            } else {
              localStorage.removeItem('aligntrack_active_session');
              setActiveSession(null);
            }
          } catch {
            localStorage.removeItem('aligntrack_active_session');
            setActiveSession(null);
          }
        } else {
          setActiveSession(null);
        }
      }

      setDailySummary(summaryRes);
      setCurrentSet(setsRes.length > 0 ? setsRes[0] : null);
      setUnreadCount(notifsRes.unreadCount || 0);

      // Automatically fire native device notifications for any new unread alerts
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const shownKey = 'aligntrack_shown_notifs';
        const shownIds = new Set<string>(JSON.parse(sessionStorage.getItem(shownKey) || '[]'));

        if (notifsRes?.notifications && Array.isArray(notifsRes.notifications)) {
          for (const item of notifsRes.notifications) {
            if (!item.isRead && !shownIds.has(item._id)) {
              try {
                new window.Notification(item.title, {
                  body: item.message,
                  icon: '/icons/icon-192.svg',
                });
                shownIds.add(item._id);
              } catch (e) {
                console.warn('Auto notification trigger error:', e);
              }
            }
          }
          sessionStorage.setItem(shownKey, JSON.stringify(Array.from(shownIds)));
        }
      }

      const effectiveStart = activeRes?.startTime || (() => {
        try {
          const s = localStorage.getItem('aligntrack_active_session');
          return s ? JSON.parse(s).startTime : null;
        } catch {
          return null;
        }
      })();

      if (effectiveStart) {
        const mins = Math.max(0, Math.round((new Date().getTime() - new Date(effectiveStart).getTime()) / 60000));
        setLiveElapsedMinutes(mins);
      } else {
        setLiveElapsedMinutes(0);
      }
    } catch (err) {
      console.error('Error refreshing app state:', err);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (user) {
      refreshAll();
    }
  }, [user, refreshAll]);

  // Live timer tick when active session exists
  useEffect(() => {
    if (!activeSession) {
      setLiveElapsedMinutes(0);
      return;
    }

    const updateMinutes = () => {
      const mins = Math.max(0, Math.round((new Date().getTime() - new Date(activeSession.startTime).getTime()) / 60000));
      setLiveElapsedMinutes(mins);
    };

    updateMinutes();
    const interval = setInterval(updateMinutes, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, [activeSession]);

  const startSession = async (customStartTime?: string | any) => {
    try {
      setIsStartingSession(true);
      const safeStartTime = typeof customStartTime === 'string' ? customStartTime : undefined;
      const startTimeIso = safeStartTime || new Date().toISOString();
      const newSession = await startWearSessionApi({ startTime: startTimeIso });
      setActiveSession(newSession);
      localStorage.setItem(
        'aligntrack_active_session',
        JSON.stringify({
          _id: newSession._id,
          startTime: newSession.startTime,
          alignerSetId: newSession.alignerSetId,
        })
      );
      toast.success('Wear entry started! Keep smiling ✨');
      await refreshAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start wear session');
    } finally {
      setIsStartingSession(false);
    }
  };

  const stopSession = async (customEndTime?: string | any, customStartTime?: string | any) => {
    try {
      setIsStoppingSession(true);
      const safeEndTime = typeof customEndTime === 'string' ? customEndTime : undefined;
      const safeStartTime = typeof customStartTime === 'string' ? customStartTime : undefined;
      const effectiveStart = safeStartTime || activeSession?.startTime;
      const res = await stopWearSessionApi({
        endTime: safeEndTime,
        startTime: effectiveStart,
      });
      localStorage.removeItem('aligntrack_active_session');
      setActiveSession(null);
      setDailySummary(res.dailySummary);
      toast.success('Aligner removed! Wear entry completed 🌸');
      await refreshAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to stop wear session');
    } finally {
      setIsStoppingSession(false);
    }
  };

  const updateDailyTarget = async (hours: number) => {
    try {
      await updateWearTimeSettingsApi({ targetHours: hours });
      toast.success(`Daily target updated to ${hours} hours! 🎯`);
      await refreshUser();
      await refreshAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update daily target');
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeSession,
        dailySummary,
        currentSet,
        unreadCount,
        liveElapsedMinutes,
        isStartingSession,
        isStoppingSession,
        startSession,
        stopSession,
        updateDailyTarget,
        refreshAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
