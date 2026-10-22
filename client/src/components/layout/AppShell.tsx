import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { Modal } from '../ui/Modal';
import {
  Layers,
  HelpCircle,
  CalendarCheck,
  FileText,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AppShell: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

  const extraMobileNav = [
    { name: 'My Aligners', path: '/aligners', icon: Layers },
    { name: 'Doctor Questions', path: '/questions', icon: HelpCircle },
    { name: 'Appointments', path: '/appointments', icon: CalendarCheck },
    { name: 'Visit Reports', path: '/reports', icon: FileText },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings & Policy', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex flex-row">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <TopBar />
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onOpenMenu={() => setIsMobileMenuOpen(true)} />

      {/* Mobile Drawer / "More" Menu Modal */}
      <Modal isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} title="Menu" maxWidth="sm">
        <div className="space-y-1">
          {extraMobileNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                    isActive ? 'bg-[#E9E3FF] text-[#5A54C7]' : 'text-[#8885A5] hover:bg-[#F8F7FF]'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
          <div className="pt-3 border-t border-[#E9E3FF]">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-sm font-medium text-[#D32F2F] hover:bg-[#FFE8E5] transition-colors"
            >
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
