import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  BookOpen,
  Menu,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Wear Time', path: '/wear-time', icon: Clock },
    { name: 'Journal', path: '/journal', icon: BookOpen },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E9E3FF] px-3 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(155,138,251,0.08)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive ? 'text-[#7775E8] font-semibold' : 'text-[#8885A5] hover:text-[#292747]'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-[10px]">{item.name}</span>
          </NavLink>
        );
      })}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[#8885A5] hover:text-[#292747]"
      >
        <Menu size={20} />
        <span className="text-[10px]">More</span>
      </button>
    </nav>
  );
};
