import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, Play, Square, Sparkles, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatHoursMinutes } from '../../utils/formatters';

export const TopBar: React.FC = () => {
  const { user } = useAuth();
  const { activeSession, liveElapsedMinutes, startSession, stopSession, isStartingSession, isStoppingSession, unreadCount } = useApp();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Good morning', icon: '☀️' };
    if (hour >= 12 && hour < 17) return { text: 'Good afternoon', icon: '🌤️' };
    if (hour >= 17 && hour < 22) return { text: 'Good evening', icon: '✨' };
    return { text: 'Good evening', icon: '🌙' };
  };

  const greeting = getGreeting();
  const userName = user?.displayName || user?.email?.split('@')[0] || '';
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-20 bg-[#F8F7FF]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-[#E9E3FF]/50">
      {/* Dynamic prominent greeting */}
      <div>
        <h1 className="text-base sm:text-xl font-extrabold text-[#292747] flex items-center gap-1.5 leading-tight">
          <span>{greeting.text}{userName ? `, ${userName}` : ''}</span>
          <span className="text-base">{greeting.icon}</span>
        </h1>
        <p className="text-[11px] sm:text-xs text-[#8885A5] font-medium flex items-center gap-1 mt-0.5">
          <Sparkles size={12} className="text-[#9B8AFB]" />
          <span>{dateFormatted}</span>
        </p>
      </div>

      {/* Quick live wear timer pill & user actions */}
      <div className="flex items-center gap-3">
        {activeSession ? (
          <div className="flex items-center gap-2 bg-[#E6F7F0] border border-[#BDEBD9] rounded-full px-3 sm:px-4 py-1.5 shadow-sm animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#00875A]" />
            <span className="text-xs font-semibold text-[#00875A]">
              Wearing {formatHoursMinutes(liveElapsedMinutes)}
            </span>
            <button
              onClick={() => stopSession()}
              disabled={isStoppingSession}
              className="ml-1 text-[#00875A] hover:text-[#D32F2F] p-0.5 rounded transition-colors"
              title="Stop wearing"
            >
              <Square size={13} fill="currentColor" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => startSession()}
            disabled={isStartingSession}
            className="flex items-center gap-1.5 bg-white border border-[#E9E3FF] hover:border-[#9B8AFB] text-[#7775E8] rounded-full px-3 sm:px-4 py-1.5 text-xs font-medium shadow-sm transition-all hover:bg-[#F8F7FF]"
          >
            <Play size={13} fill="currentColor" />
            <span>Put Aligners In</span>
          </button>
        )}

        {/* Notifications */}
        <NavLink
          to="/notifications"
          className="relative p-2 rounded-full bg-white border border-[#E9E3FF] text-[#8885A5] hover:text-[#7775E8] transition-colors shadow-sm"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFB3AB] text-[#292747] text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </NavLink>

        {/* Profile / Settings link */}
        <NavLink
          to="/settings"
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white border border-[#E9E3FF] text-[#292747] hover:border-[#9B8AFB] shadow-sm transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-[#E9E3FF] text-[#7775E8] flex items-center justify-center font-bold text-xs">
            {user?.displayName ? user.displayName[0].toUpperCase() : <UserIcon size={14} />}
          </div>
          <span className="text-xs font-medium hidden sm:inline">{user?.displayName || 'My Profile'}</span>
        </NavLink>
      </div>
    </header>
  );
};
