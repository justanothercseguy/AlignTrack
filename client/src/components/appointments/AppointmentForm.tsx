import React, { useState } from 'react';
import { Appointment } from '../../types';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

interface AppointmentFormProps {
  initialData?: Appointment | null;
  defaultDate?: string;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  initialData,
  defaultDate,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [title, setTitle] = useState(initialData?.title || 'Routine Aligner Check');
  const [provider, setProvider] = useState(initialData?.provider || '');
  const [date, setDate] = useState(initialData?.date || defaultDate || '');
  const [time, setTime] = useState(initialData?.time || '10:00');
  const [location, setLocation] = useState(initialData?.location || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [oneDayBefore, setOneDayBefore] = useState(
    initialData?.reminderConfig?.oneDayBefore !== undefined ? initialData.reminderConfig.oneDayBefore : true
  );
  const [dayOf, setDayOf] = useState(
    initialData?.reminderConfig?.dayOf !== undefined ? initialData.reminderConfig.dayOf : false
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title,
      provider,
      date,
      time,
      location,
      notes,
      reminderConfig: {
        oneDayBefore,
        dayOf,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        required
        placeholder="e.g. 6-Week Aligner Checkup"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Doctor / Clinic"
          placeholder="e.g. Dr. Jane Smith / Smile Care"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        />
        <Input
          label="Location / Address"
          placeholder="e.g. Suite 400, 123 Main St"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          label="Time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>

      <Textarea
        label="Notes & Questions"
        placeholder="Things you want to mention or ask during the appointment..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* Reminder preferences */}
      <div className="p-3 bg-[#F8F7FF] rounded-2xl border border-[#E9E3FF] space-y-2">
        <span className="text-xs font-semibold text-[#292747] block mb-1">
          Reminders
        </span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={oneDayBefore}
            onChange={(e) => setOneDayBefore(e.target.checked)}
            className="rounded border-[#E9E3FF] text-[#9B8AFB] focus:ring-[#9B8AFB]"
          />
          <span className="text-xs text-[#8885A5]">1 day before appointment (Default)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={dayOf}
            onChange={(e) => setDayOf(e.target.checked)}
            className="rounded border-[#E9E3FF] text-[#9B8AFB] focus:ring-[#9B8AFB]"
          />
          <span className="text-xs text-[#8885A5]">Morning of appointment</span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E3FF]">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isLoading}>
          {initialData ? 'Update Appointment' : 'Schedule Appointment'}
        </Button>
      </div>
    </form>
  );
};
