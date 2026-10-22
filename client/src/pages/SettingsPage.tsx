import React, { useState } from 'react';
import { TreatmentSettings } from '../components/settings/TreatmentSettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { AccountSettings } from '../components/settings/AccountSettings';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { updateTreatmentSettingsApi, updateNotificationPreferencesApi } from '../api/settings';
import { Sliders, Bell, User as UserIcon } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { refreshAll } = useApp();
  const [activeTab, setActiveTab] = useState<'treatment' | 'notifications' | 'account'>('treatment');

  const handleSaveTreatment = async (settings: any) => {
    await updateTreatmentSettingsApi(settings);
    await refreshUser();
    await refreshAll();
  };

  const handleSaveNotifications = async (prefs: any) => {
    await updateNotificationPreferencesApi(prefs);
    await refreshUser();
    await refreshAll();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#292747]">Settings & Preferences</h2>
        <p className="text-xs text-[#8885A5]">
          Customize your aligner phase policies, daily wear targets, reminders, and data
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-[#E9E3FF] pb-3">
        <button
          onClick={() => setActiveTab('treatment')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
            activeTab === 'treatment'
              ? 'bg-[#E9E3FF] text-[#5A54C7] shadow-sm'
              : 'text-[#8885A5] hover:text-[#292747] hover:bg-white'
          }`}
        >
          <Sliders size={15} />
          <span>Treatment Policy</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
            activeTab === 'notifications'
              ? 'bg-[#E9E3FF] text-[#5A54C7] shadow-sm'
              : 'text-[#8885A5] hover:text-[#292747] hover:bg-white'
          }`}
        >
          <Bell size={15} />
          <span>Reminders</span>
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
            activeTab === 'account'
              ? 'bg-[#E9E3FF] text-[#5A54C7] shadow-sm'
              : 'text-[#8885A5] hover:text-[#292747] hover:bg-white'
          }`}
        >
          <UserIcon size={15} />
          <span>Account & Data</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'treatment' && (
        <TreatmentSettings
          initialSettings={user?.treatmentSettings}
          onSave={handleSaveTreatment}
        />
      )}

      {activeTab === 'notifications' && (
        <NotificationSettings
          initialPreferences={user?.notificationPreferences}
          onSave={handleSaveNotifications}
        />
      )}

      {activeTab === 'account' && <AccountSettings />}
    </div>
  );
};
