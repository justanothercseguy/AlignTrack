import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Clock,
  BookOpen,
  HelpCircle,
  CalendarCheck,
  FileText,
  Bell,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const Sidebar: React.FC = () => {
  const { unreadCount } = useApp();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'My Aligners', path: '/aligners', icon: Layers },
    { name: 'Wear Time', path: '/wear-time', icon: Clock },
    { name: 'Journal & Issues', path: '/journal', icon: BookOpen },
    { name: 'Doctor Questions', path: '/questions', icon: HelpCircle },
    { name: 'Appointments', path: '/appointments', icon: CalendarCheck },
    { name: 'Visit Reports', path: '/reports', icon: FileText },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E9E3FF]/60 h-screen sticky top-0 px-4 py-6 select-none z-30">
      {/* Brand logo */}
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#9B8AFB] to-[#7775E8] flex items-center justify-center text-white shadow-md shadow-[#9B8AFB]/30">
          <Sparkles size={22} />
        </div>
        <div>
          <h1 className="font-bold text-lg text-[#292747] tracking-tight">AlignTrack</h1>
          <p className="text-[11px] font-medium text-[#8885A5]">Smile Journey</p>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#E9E3FF] text-[#5A54C7] shadow-sm font-semibold'
                    : 'text-[#8885A5] hover:text-[#292747] hover:bg-[#F8F7FF]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon size={19} />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-[#9B8AFB] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Subtle bottom tag */}
      <div className="pt-4 border-t border-[#E9E3FF]/50 px-3">
        <div className="bg-[#F8F7FF] rounded-2xl p-3 border border-[#E9E3FF]">
          <p className="text-[11px] text-[#8885A5] leading-relaxed">
            Personal tracker. Follow your orthodontist's prescribed directions.
          </p>
        </div>
      </div>
    </aside>
  );
};
