import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AlignerSet } from '../../types';
import { addDays, format, parseISO } from 'date-fns';
import { Sparkles, Calendar, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { formatDate } from '../../utils/dates';

interface ConfirmChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentSet: AlignerSet | null;
  onConfirm: (payload: {
    actualChangeDate: string;
    actualChangeTime?: string;
    nextSetNumber: number;
    nextSetPlannedDuration: number;
    nextSetActualStartDate: string;
    nextSetActualStartTime?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export const ConfirmChangeDialog: React.FC<ConfirmChangeDialogProps> = ({
  isOpen,
  onClose,
  currentSet,
  onConfirm,
  isLoading = false,
}) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [actualChangeDate, setActualChangeDate] = useState<string>(
    currentSet?.plannedChangeDate || todayStr
  );
  const [actualChangeTime, setActualChangeTime] = useState<string>(
    currentSet?.plannedChangeTime || '11:00'
  );
  const [nextSetNumber, setNextSetNumber] = useState<number>(
    currentSet ? currentSet.setNumber + 1 : 2
  );
  // Default 10 days for sets 1-5, 7 days for sets 6+
  const defaultNextDuration = (currentSet?.setNumber || 1) + 1 >= 6 ? 7 : 10;
  const [nextDuration, setNextDuration] = useState<number>(defaultNextDuration);

  if (!currentSet) return null;

  const isFuture = actualChangeDate > todayStr;

  // Calculate next planned change date dynamically
  let calculatedNextChangeDate = '';
  try {
    if (actualChangeDate && nextDuration > 0) {
      const nextEnd = addDays(parseISO(actualChangeDate), nextDuration);
      calculatedNextChangeDate = format(nextEnd, 'yyyy-MM-dd');
    }
  } catch (err) {
    // ignore
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm({
      actualChangeDate,
      actualChangeTime,
      nextSetNumber: Number(nextSetNumber),
      nextSetPlannedDuration: Number(nextDuration),
      nextSetActualStartDate: actualChangeDate,
      nextSetActualStartTime: actualChangeTime,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Aligner Switch / Plan Change" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Compact Current Set Pill */}
        <div className="flex items-center justify-between p-3 bg-[#F8F7FF] border border-[#E9E3FF] rounded-xl text-xs">
          <div>
            <span className="text-[10px] font-bold text-[#8885A5] uppercase tracking-wider block">
              Current Active Set
            </span>
            <span className="font-extrabold text-[#292747] text-sm">
              Set {currentSet.setNumber}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#8885A5] block">Prescribed Duration</span>
            <span className="font-semibold text-[#7775E8]">{currentSet.plannedDurationDays} days</span>
          </div>
        </div>

        {/* Change Date and Time Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={isFuture ? "Planned Switch Date" : "Actual Switch Date"}
            type="date"
            required
            value={actualChangeDate}
            onChange={(e) => setActualChangeDate(e.target.value)}
          />
          <Input
            label="Switch Time"
            type="time"
            required
            value={actualChangeTime}
            onChange={(e) => setActualChangeTime(e.target.value)}
            helperText="e.g. 11:00 AM"
          />
        </div>

        {/* Future Date vs Immediate Notice */}
        {isFuture ? (
          <div className="p-3 bg-[#E9E3FF]/50 border border-[#D4CCFF] rounded-xl text-xs text-[#5A54C7] flex items-start gap-2">
            <Clock size={16} className="shrink-0 mt-0.5 text-[#7775E8]" />
            <div>
              <strong className="block mb-0.5">Future Date Selected ({formatDate(actualChangeDate)})</strong>
              <p className="text-[11px] leading-relaxed text-[#292747]">
                Since this date is in the future, <strong>Set {currentSet.setNumber} will remain your active set</strong> until then. Set {nextSetNumber} will be scheduled as planned to start on {formatDate(actualChangeDate)}.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-[#E6F7F0] border border-[#BDEBD9] rounded-xl text-xs text-[#00875A] flex items-center gap-2">
            <Sparkles size={14} className="shrink-0" />
            <p className="text-[11px]">
              Confirming switch: Set {currentSet.setNumber} will be marked completed today.
            </p>
          </div>
        )}

        {/* Next Set Configuration */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Next Set #"
            type="number"
            min={1}
            required
            value={nextSetNumber}
            onChange={(e) => setNextSetNumber(Number(e.target.value))}
          />
          <Input
            label="Duration (Days)"
            type="number"
            min={1}
            max={90}
            required
            value={nextDuration}
            onChange={(e) => setNextDuration(Number(e.target.value))}
          />
        </div>

        {/* Next Plan Preview */}
        {calculatedNextChangeDate && (
          <p className="text-xs text-[#8885A5] bg-[#F8F7FF] px-3 py-2 rounded-lg border border-[#E9E3FF]">
            Set {nextSetNumber} will run from <strong>{formatDate(actualChangeDate)}</strong> to{' '}
            <strong>{formatDate(calculatedNextChangeDate)}</strong> ({nextDuration} days).
          </p>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E9E3FF]">
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            <span className="flex items-center gap-1.5">
              {isFuture ? 'Schedule Switch' : 'Confirm Switch'} <ArrowRight size={14} />
            </span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
