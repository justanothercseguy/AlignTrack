import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AlignerSet } from '../../types';
import { formatDate, formatTime } from '../../utils/dates';
import { Calendar, Clock, Edit2 } from 'lucide-react';

interface AlignerSetCardProps {
  set: AlignerSet;
  onEdit: (set: AlignerSet) => void;
  onConfirmChange?: (set: AlignerSet) => void;
  onMakeActive?: (set: AlignerSet) => void;
}

export const AlignerSetCard: React.FC<AlignerSetCardProps> = ({
  set,
  onEdit,
  onConfirmChange,
  onMakeActive,
}) => {
  const isCurrent = set.status === 'current';

  const statusBadge = () => {
    switch (set.status) {
      case 'current':
        return <Badge variant="lavender">Currently Active</Badge>;
      case 'completed':
        return <Badge variant="mint">Completed</Badge>;
      case 'planned':
        return <Badge variant="neutral">Planned</Badge>;
      case 'paused':
        return <Badge variant="peach">Paused</Badge>;
      default:
        return <Badge variant="neutral">{set.status}</Badge>;
    }
  };

  return (
    <Card
      className={`relative transition-all duration-200 ${
        isCurrent
          ? 'border-2 border-[#9B8AFB] shadow-[0_6px_24px_rgba(155,138,251,0.18)] bg-gradient-to-b from-[#F8F7FF] to-white'
          : 'hover:border-[#D4CCFF]'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[#292747]">
            Set {set.setNumber}
          </span>
          {statusBadge()}
        </div>
        <button
          onClick={() => onEdit(set)}
          className="p-1.5 rounded-full text-[#8885A5] hover:text-[#7775E8] hover:bg-[#E9E3FF]/50 transition-colors"
          title="Edit set"
        >
          <Edit2 size={15} />
        </button>
      </div>

      {set.label && set.label !== `Set ${set.setNumber}` && (
        <p className="text-xs text-[#8885A5] mb-2">{set.label}</p>
      )}

      {/* Date timeline block */}
      <div className="space-y-2 text-xs text-[#8885A5] mb-4 bg-[#F8F7FF] p-3 rounded-xl border border-[#E9E3FF]">
        {/* Start dates */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} className="text-[#7775E8]" />
            {set.actualStartDate ? 'Actual Start:' : 'Planned Start:'}
          </span>
          <span className="font-semibold text-[#292747]">
            {formatDate(set.actualStartDate || set.plannedStartDate) || 'Not set'}
            {(set.actualStartTime || set.plannedStartTime) && (
              <span className="text-[10px] text-[#7775E8] font-medium ml-1">
                @{formatTime(set.actualStartTime || set.plannedStartTime)}
              </span>
            )}
          </span>
        </div>

        {/* Change dates */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-[#7775E8]" />
            {set.actualChangeDate ? 'Actual End:' : 'Planned Change:'}
          </span>
          <span className="font-semibold text-[#292747]">
            {formatDate(set.actualChangeDate || set.plannedChangeDate) || 'Not calculated'}
            {(set.actualChangeTime || set.plannedChangeTime) && (
              <span className="text-[10px] text-[#7775E8] font-medium ml-1">
                @{formatTime(set.actualChangeTime || set.plannedChangeTime)}
              </span>
            )}
          </span>
        </div>

        {/* Prescribed duration */}
        <div className="flex items-center justify-between pt-1 border-t border-[#E9E3FF]/60 text-[11px]">
          <span>Duration:</span>
          <span className="font-medium text-[#292747]">{set.plannedDurationDays} days</span>
        </div>
      </div>

      {set.notes && (
        <p className="text-xs text-[#8885A5] line-clamp-2 italic mb-3">"{set.notes}"</p>
      )}

      {/* Bottom actions */}
      <div className="pt-2 border-t border-[#E9E3FF]/60 flex items-center gap-2">
        {isCurrent && onConfirmChange ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onConfirmChange(set)}
            className="w-full text-xs"
          >
            Log Aligner Change / Review
          </Button>
        ) : onMakeActive ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMakeActive(set)}
            className="w-full text-xs"
          >
            Mark as Currently Active
          </Button>
        ) : null}
      </div>
    </Card>
  );
};
