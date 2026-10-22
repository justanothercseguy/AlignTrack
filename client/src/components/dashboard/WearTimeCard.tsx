import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProgressRing } from '../ui/ProgressRing';
import { useApp } from '../../contexts/AppContext';
import { Play, Square, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatHoursMinutes } from '../../utils/formatters';

export const WearTimeCard: React.FC = () => {
  const {
    activeSession,
    dailySummary,
    liveElapsedMinutes,
    startSession,
    stopSession,
    isStartingSession,
    isStoppingSession,
  } = useApp();

  const loggedMinutes = dailySummary ? dailySummary.totalMinutes : 0;
  // If a session is actively running, include the live minutes
  const totalDisplayMinutes = loggedMinutes + (activeSession ? liveElapsedMinutes : 0);
  const targetHours = dailySummary ? dailySummary.targetHours : 20;
  const targetMinutes = targetHours * 60;
  const progressPercent = Math.min(100, Math.round((totalDisplayMinutes / targetMinutes) * 100));

  const remainingMinutes = Math.max(0, targetMinutes - totalDisplayMinutes);
  const extraMinutes = Math.max(0, totalDisplayMinutes - targetMinutes);
  const isTargetMet = totalDisplayMinutes >= targetMinutes;

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#292747] text-base">Today's Wear Time</h3>
          {isTargetMet ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#00875A] bg-[#E6F7F0] px-2.5 py-1 rounded-full border border-[#BDEBD9]">
              <CheckCircle2 size={13} />
              Target Met ✨
            </span>
          ) : (
            <span className="text-xs font-medium text-[#8885A5]">Target: {targetHours}h</span>
          )}
        </div>

        {/* Circular Progress Display */}
        <div className="flex flex-col items-center justify-center py-2">
          <ProgressRing
            progress={progressPercent}
            size={170}
            strokeWidth={13}
            color={isTargetMet ? '#00875A' : '#9B8AFB'}
            bgColor="#E9E3FF"
          >
            <span className="text-2xl font-extrabold text-[#292747]">
              {formatHoursMinutes(totalDisplayMinutes)}
            </span>
            <span className="text-xs font-medium text-[#8885A5] mt-0.5">
              of {targetHours}h goal
            </span>
            {isTargetMet ? (
              <span className="text-[11px] font-semibold text-[#00875A] mt-1">
                +{formatHoursMinutes(extraMinutes)} extra
              </span>
            ) : (
              <span className="text-[11px] font-medium text-[#8885A5] mt-1">
                {formatHoursMinutes(remainingMinutes)} to go
              </span>
            )}
          </ProgressRing>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-3 border-t border-[#E9E3FF]/60">
        {activeSession ? (
          <Button
            variant="danger"
            onClick={() => stopSession()}
            isLoading={isStoppingSession}
            className="w-full flex items-center gap-2"
          >
            <Square size={16} fill="currentColor" />
            <span>Remove Aligners (Stop Timer)</span>
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => startSession()}
            isLoading={isStartingSession}
            className="w-full flex items-center gap-2"
          >
            <Play size={16} fill="currentColor" />
            <span>Put Aligners In (Start Timer)</span>
          </Button>
        )}
      </div>
    </Card>
  );
};
