import React, { useState, useEffect } from 'react';
import { AlignerSet } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

interface AlignerSetFormProps {
  initialData?: AlignerSet | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AlignerSetForm: React.FC<AlignerSetFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [setNumber, setSetNumber] = useState<number>(initialData?.setNumber || 1);
  const [label, setLabel] = useState<string>(initialData?.label || '');
  const [plannedDurationDays, setPlannedDurationDays] = useState<number>(initialData?.plannedDurationDays || 10);
  const [plannedStartDate, setPlannedStartDate] = useState<string>(initialData?.plannedStartDate || '');
  const [plannedStartTime, setPlannedStartTime] = useState<string>(initialData?.plannedStartTime || '');
  const [actualStartDate, setActualStartDate] = useState<string>(initialData?.actualStartDate || '');
  const [actualStartTime, setActualStartTime] = useState<string>(initialData?.actualStartTime || '');
  const [actualChangeDate, setActualChangeDate] = useState<string>(initialData?.actualChangeDate || '');
  const [actualChangeTime, setActualChangeTime] = useState<string>(initialData?.actualChangeTime || '');
  const [status, setStatus] = useState<string>(initialData?.status || 'planned');
  const [wearTimeTargetOverride, setWearTimeTargetOverride] = useState<string>(
    initialData?.wearTimeTargetOverride !== null && initialData?.wearTimeTargetOverride !== undefined
      ? String(initialData.wearTimeTargetOverride)
      : ''
  );
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  const [recalculateFuture, setRecalculateFuture] = useState<boolean>(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      setNumber: Number(setNumber),
      label: label || `Set ${setNumber}`,
      plannedDurationDays: Number(plannedDurationDays),
      plannedStartDate: plannedStartDate || undefined,
      plannedStartTime: plannedStartTime || undefined,
      actualStartDate: actualStartDate || undefined,
      actualStartTime: actualStartTime || undefined,
      actualChangeDate: actualChangeDate || undefined,
      actualChangeTime: actualChangeTime || undefined,
      status,
      wearTimeTargetOverride: wearTimeTargetOverride ? Number(wearTimeTargetOverride) : null,
      notes,
      recalculateFuture,
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Set Number"
          type="number"
          min={1}
          required
          value={setNumber}
          onChange={(e) => setSetNumber(Number(e.target.value))}
        />
        <Input
          label="Label (Optional)"
          placeholder="e.g. Set 1, Refinement 2"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Planned Duration (Days)"
          type="number"
          min={1}
          max={90}
          required
          value={plannedDurationDays}
          onChange={(e) => setPlannedDurationDays(Number(e.target.value))}
          helperText="Standard is 10 days (Phase A) or 7 days (Phase B)"
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'planned', label: 'Planned (Upcoming)' },
            { value: 'current', label: 'Current (Active)' },
            { value: 'completed', label: 'Completed' },
            { value: 'paused', label: 'Paused' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Planned Start Date"
            type="date"
            value={plannedStartDate}
            onChange={(e) => setPlannedStartDate(e.target.value)}
          />
          <Input
            label="Planned Time"
            type="time"
            value={plannedStartTime}
            onChange={(e) => setPlannedStartTime(e.target.value)}
            helperText="e.g. 11:00 AM"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Actual Start Date"
            type="date"
            value={actualStartDate}
            onChange={(e) => setActualStartDate(e.target.value)}
          />
          <Input
            label="Actual Time"
            type="time"
            value={actualStartTime}
            onChange={(e) => setActualStartTime(e.target.value)}
            helperText="Time put in"
          />
        </div>
      </div>

      {status === 'completed' && (
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Actual Change Date"
            type="date"
            value={actualChangeDate}
            onChange={(e) => setActualChangeDate(e.target.value)}
            helperText="The date you switched"
          />
          <Input
            label="Actual Change Time"
            type="time"
            value={actualChangeTime}
            onChange={(e) => setActualChangeTime(e.target.value)}
            helperText="Time of switch"
          />
        </div>
      )}

      <Input
        label="Wear-Time Target Override (Hours/Day)"
        type="number"
        min={1}
        max={24}
        step={0.5}
        placeholder="Leave blank to use default phase target"
        value={wearTimeTargetOverride}
        onChange={(e) => setWearTimeTargetOverride(e.target.value)}
      />

      <Textarea
        label="Notes"
        placeholder="Special instructions, attachment positions, tightness notes..."
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {initialData && (
        <label className="flex items-center gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={recalculateFuture}
            onChange={(e) => setRecalculateFuture(e.target.checked)}
            className="rounded border-[#E9E3FF] text-[#9B8AFB] focus:ring-[#9B8AFB]"
          />
          <span className="text-xs text-[#8885A5]">
            Automatically update planned dates for subsequent sets based on changes
          </span>
        </label>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E9E3FF]/60">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isLoading}>
          {initialData ? 'Save Changes' : 'Create Aligner Set'}
        </Button>
      </div>
    </form>
  );
};
