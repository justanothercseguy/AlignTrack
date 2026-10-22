import React, { useState } from 'react';
import { JournalEntry } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { JOURNAL_CATEGORIES, SEVERITY_LEVELS } from '../../utils/constants';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface IssueFormProps {
  initialData?: JournalEntry | null;
  defaultDate?: string;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const IssueForm: React.FC<IssueFormProps> = ({
  initialData,
  defaultDate,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [date, setDate] = useState(initialData?.date || defaultDate || todayStr);
  const [time, setTime] = useState(initialData?.time || '12:00');
  const [category, setCategory] = useState(initialData?.category || 'pain_pressure');
  const [severity, setSeverity] = useState(initialData?.severity || 'Mild');
  const [affectedArea, setAffectedArea] = useState(initialData?.affectedArea || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isOngoing, setIsOngoing] = useState(initialData?.isOngoing !== undefined ? initialData.isOngoing : true);
  const [needsDiscussion, setNeedsDiscussion] = useState(
    initialData?.needsDiscussion !== undefined ? initialData.needsDiscussion : false
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      date,
      time,
      category,
      severity,
      affectedArea,
      description,
      isOngoing,
      needsDiscussion,
    });
  };

  const isSevere = severity === 'Severe';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Date Noticed"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          label="Time (Optional)"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          options={JOURNAL_CATEGORIES}
        />
        <Select
          label="Severity"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          options={SEVERITY_LEVELS}
        />
      </div>

      {isSevere && (
        <div className="p-3 bg-[#FFE8E5] border border-[#FFB3AB] rounded-2xl flex items-start gap-2.5 text-xs text-[#BF2600]">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <p>
            If you are experiencing severe or debilitating pain, abnormal bleeding, or injury, please contact your orthodontist or urgent dental care immediately.
          </p>
        </div>
      )}

      <Input
        label="Affected Area or Tooth"
        placeholder="e.g. Upper right canine, lower front attachment, molar gum"
        value={affectedArea}
        onChange={(e) => setAffectedArea(e.target.value)}
      />

      <Textarea
        label="Description & Details"
        required
        placeholder="Describe what you feel (e.g., pinching when biting down, sharp edge on the left tongue side)..."
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="p-3 bg-[#F8F7FF] rounded-2xl border border-[#E9E3FF] space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isOngoing}
            onChange={(e) => setIsOngoing(e.target.checked)}
            className="rounded border-[#E9E3FF] text-[#9B8AFB] focus:ring-[#9B8AFB]"
          />
          <span className="text-xs text-[#292747] font-medium">Issue is currently ongoing</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={needsDiscussion}
            onChange={(e) => setNeedsDiscussion(e.target.checked)}
            className="rounded border-[#E9E3FF] text-[#9B8AFB] focus:ring-[#9B8AFB]"
          />
          <span className="text-xs text-[#7775E8] font-bold">Flag to discuss at next orthodontist appointment</span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E3FF]">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isLoading}>
          {initialData ? 'Update Entry' : 'Save Symptom Entry'}
        </Button>
      </div>
    </form>
  );
};
