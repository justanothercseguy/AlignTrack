import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { NotificationPreferences } from '../../types';
import toast from 'react-hot-toast';

interface NotificationSettingsProps {
  initialPreferences?: NotificationPreferences;
  onSave: (preferences: NotificationPreferences) => Promise<void>;
  isLoading?: boolean;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  initialPreferences,
  onSave,
  isLoading = false,
}) => {
  const [appt1Day, setAppt1Day] = useState(
    initialPreferences?.appointmentReminder1DayBefore !== undefined
      ? initialPreferences.appointmentReminder1DayBefore
      : true
  );
  const [apptDayOf, setApptDayOf] = useState(
    initialPreferences?.appointmentReminderDayOf !== undefined
      ? initialPreferences.appointmentReminderDayOf
      : false
  );
  const [apptTime, setApptTime] = useState(initialPreferences?.appointmentReminderTime || '09:00');

  const [aligner3Day, setAligner3Day] = useState(
    initialPreferences?.alignerReminder3DaysBefore || false
  );
  const [aligner2Day, setAligner2Day] = useState(
    initialPreferences?.alignerReminder2DaysBefore || false
  );
  const [aligner1Day, setAligner1Day] = useState(
    initialPreferences?.alignerReminder1DayBefore !== undefined
      ? initialPreferences.alignerReminder1DayBefore
      : true
  );
  const [alignerDayOf, setAlignerDayOf] = useState(
    initialPreferences?.alignerReminderOnDay || false
  );
  const [alignerOverdue, setAlignerOverdue] = useState(
    initialPreferences?.alignerOverdueReminder !== undefined
      ? initialPreferences.alignerOverdueReminder
      : true
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      appointmentReminder1DayBefore: appt1Day,
      appointmentReminderDayOf: apptDayOf,
      appointmentReminderTime: apptTime,
      alignerReminder3DaysBefore: aligner3Day,
      alignerReminder2DaysBefore: aligner2Day,
      alignerReminder1DayBefore: aligner1Day,
      alignerReminderOnDay: alignerDayOf,
      alignerOverdueReminder: alignerOverdue,
      wearTimeReminder: false,
      wearTimeReminderInterval: 4,
    });
    toast.success('Notification settings saved');
  };

  return (
    <Card className="mb-6">
      <div className="mb-4">
        <h3 className="font-bold text-base text-[#292747]">Notification & Reminder Preferences</h3>
        <p className="text-xs text-[#8885A5]">
          Manage in-app alerts, browser pushes, and reminder scheduling.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Appointment Reminders */}
        <div className="bg-[#F8F7FF] p-4 rounded-2xl border border-[#E9E3FF]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#7775E8] mb-3">
            Appointment Reminders
          </h4>
          <div className="space-y-3 text-xs text-[#292747]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={appt1Day}
                onChange={(e) => setAppt1Day(e.target.checked)}
                className="rounded border-[#E9E3FF] text-[#9B8AFB] focus:ring-[#9B8AFB]"
              />
              <span className="font-medium">1 day before appointment (Default)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={apptDayOf}
                onChange={(e) => setApptDayOf(e.target.checked)}
                className="rounded border-[#E9E3FF] text-[#9B8AFB] focus:ring-[#9B8AFB]"
              />
              <span className="font-medium">On the morning of the appointment</span>
            </label>
            <div className="pt-2 max-w-xs">
              <Input
                label="Preferred Reminder Time (Local)"
                type="time"
                value={apptTime}
                onChange={(e) => setApptTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Aligner Reminders */}
        <div className="bg-[#F8F7FF] p-4 rounded-2xl border border-[#E9E3FF]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#7775E8] mb-3">
            Aligner Switch Reminders
          </h4>
          <div className="space-y-3 text-xs text-[#292747]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aligner1Day}
                onChange={(e) => setAligner1Day(e.target.checked)}
                className="rounded border-[#E9E3FF] text-[#9B8AFB] focus:ring-[#9B8AFB]"
              />
              <span className="font-medium">1 day before planned switch date (Default)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aligner2Day}
                onChange={(e) => setAligner2Day(e.target.checked)}
                className="rounded border-[#E9E3FF] text-[#9B8AFB] focus:ring-[#9B8AFB]"
              />
              <span>2 days before planned switch date</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aligner3Day}
                onChange={(e) => setAligner3Day(e.target.checked)}
                className="rounded border-[#E9E3FF] text-[#9B8AFB] focus:ring-[#9B8AFB]"
              />
              <span>3 days before planned switch date</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={alignerDayOf}
                onChange={(e) => setAlignerDayOf(e.target.checked)}
                className="rounded border-[#E9E3FF] text-[#9B8AFB] focus:ring-[#9B8AFB]"
              />
              <span>On the planned switch date</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={alignerOverdue}
                onChange={(e) => setAlignerOverdue(e.target.checked)}
                className="rounded border-[#E9E3FF] text-[#9B8AFB] focus:ring-[#9B8AFB]"
              />
              <span className="font-medium text-[#BF2600]">
                Notify if scheduled date has passed without confirmation
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Save Notification Preferences
          </Button>
        </div>
      </form>
    </Card>
  );
};
