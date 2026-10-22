import React, { useState, useMemo } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { format, addDays } from 'date-fns';
import { formatHoursMinutes } from '../../utils/formatters';
import { Clock } from 'lucide-react';

interface ManualSessionFormProps {
  onSubmit: (payload: { startTime: string; endTime: string }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ManualSessionForm: React.FC<ManualSessionFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [date, setDate] = useState<string>(todayStr);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('13:00');
  const [isNextDay, setIsNextDay] = useState<boolean>(false);

  // Auto-detect next day if endTime < startTime
  const autoNextDay = useMemo(() => {
    return endTime < startTime;
  }, [startTime, endTime]);

  const effectiveNextDay = isNextDay || autoNextDay;

  const durationMinutes = useMemo(() => {
    try {
      const start = new Date(`${date}T${startTime}:00`);
      let end = new Date(`${date}T${endTime}:00`);
      if (effectiveNextDay) {
        end = addDays(end, 1);
      }
      const diff = Math.round((end.getTime() - start.getTime()) / 60000);
      return Math.max(0, diff);
    } catch {
      return 0;
    }
  }, [date, startTime, endTime, effectiveNextDay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const startDate = new Date(`${date}T${startTime}:00`);
    let endDate = new Date(`${date}T${endTime}:00`);
    if (effectiveNextDay) {
      endDate = addDays(endDate, 1);
    }

    await onSubmit({
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Date"
        type="date"
        required
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Put In Time"
          type="time"
          required
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <Input
          label="Removed Time"
          type="time"
          required
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      {autoNextDay && (
        <div className="text-xs text-[#7775E8] bg-[#F8F7FF] p-2.5 rounded-xl border border-[#E9E3FF]">
          🌙 Overnight session detected: Removed time is on the next day (+1 day).
        </div>
      )}

      {/* Duration preview */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7FF] border border-[#E9E3FF] text-xs">
        <span className="text-[#8885A5] flex items-center gap-1.5 font-medium">
          <Clock size={14} className="text-[#9B8AFB]" />
          Calculated Wear Duration:
        </span>
        <span className="font-bold text-[#292747] text-sm">
          {formatHoursMinutes(durationMinutes)}
        </span>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E3FF]">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isLoading} disabled={durationMinutes <= 0}>
          Save Wear Session
        </Button>
      </div>
    </form>
  );
};
