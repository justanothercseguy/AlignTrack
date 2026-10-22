import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AlignerSet } from '../../types';
import { formatDate, formatTime, getDaysCountdown } from '../../utils/dates';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { Sparkles, ArrowRight, AlertCircle, Calendar } from 'lucide-react';

interface DashboardHeroProps {
  currentSet: AlignerSet | null;
  onConfirmChange: () => void;
  onAddNewSet: () => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  currentSet,
  onConfirmChange,
  onAddNewSet,
}) => {
  if (!currentSet) {
    return (
      <Card variant="hero" className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} className="text-[#FFF0EB]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Treatment Plan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Start Your Aligner Tracking</h2>
            <p className="text-white/80 text-sm max-w-md">
              Add your current aligner set and start dates to begin tracking daily progress, changes, and milestones.
            </p>
          </div>
          <Button variant="secondary" onClick={onAddNewSet} size="lg">
            Add First Set
          </Button>
        </div>
      </Card>
    );
  }

  const startDate = currentSet.actualStartDate || currentSet.plannedStartDate;
  const calculatedDays = startDate
    ? Math.max(1, differenceInCalendarDays(new Date(), parseISO(startDate)) + 1)
    : 1;
  const elapsed = currentSet.daysElapsed || calculatedDays;
  const duration = currentSet.plannedDurationDays || 10;
  const progressPercent = Math.min(100, Math.round((elapsed / duration) * 100));
  const countdown = getDaysCountdown(currentSet.plannedChangeDate);

  return (
    <Card variant="hero" className="mb-6 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top badge bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-white">
              Currently Active
            </span>
            {currentSet.isOverdue && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFD0CB] text-[#BF2600] flex items-center gap-1 shadow-sm">
                <AlertCircle size={13} />
                Planned Date Passed
              </span>
            )}
          </div>
          <div className="text-xs text-white/80 flex items-center gap-1.5 font-medium">
            <Calendar size={14} />
            Started {formatDate(startDate)}{currentSet.actualStartTime ? ` at ${formatTime(currentSet.actualStartTime)}` : ''}
          </div>
        </div>

        {/* Aligner title and countdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Set {currentSet.setNumber} {currentSet.label && currentSet.label !== `Set ${currentSet.setNumber}` ? `(${currentSet.label})` : ''}
            </h2>
            <p className="text-white/90 text-sm font-medium mb-4">
              Day {elapsed} of {duration} days planned
            </p>

            {/* Progress bar */}
            <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden p-0.5 mb-2 backdrop-blur-sm">
              <div
                className="bg-white h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/70">
              <span>Day 1</span>
              <span>Planned Change: {formatDate(currentSet.plannedChangeDate)}{currentSet.plannedChangeTime ? ` at ${formatTime(currentSet.plannedChangeTime)}` : ''}</span>
            </div>
          </div>

          {/* Right action block */}
          <div className="md:col-span-5 flex flex-col items-start md:items-end justify-center">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 w-full text-left md:text-right mb-4">
              <p className="text-xs text-white/80 uppercase tracking-wider mb-1 font-semibold">Planned Timeline</p>
              <p className="text-xl font-bold">{countdown.text}</p>
              <p className="text-[11px] text-white/70 mt-1">
                Always confirm with your orthodontist before changing aligners.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={onConfirmChange}
              size="md"
              className="w-full sm:w-auto shadow-md"
            >
              <span className="flex items-center gap-2">
                Log Aligner Change <ArrowRight size={16} />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
