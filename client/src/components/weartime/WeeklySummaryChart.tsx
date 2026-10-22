import React from 'react';
import { Card } from '../ui/Card';
import { DailyWearSummary } from '../../types';
import { formatDate } from '../../utils/dates';

interface WeeklySummaryChartProps {
  summaries: DailyWearSummary[];
}

export const WeeklySummaryChart: React.FC<WeeklySummaryChartProps> = ({ summaries }) => {
  const maxHours = 24;

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[#292747] text-base">Past 7 Days Wear Time</h3>
          <p className="text-xs text-[#8885A5]">Daily adherence against prescribed targets</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#9B8AFB]" />
            <span className="text-[#8885A5]">Wear Time</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#7775E8]" />
            <span className="text-[#8885A5]">Target</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-6 pb-2 px-2">
        {summaries.map((summary) => {
          const heightPercent = Math.min(100, Math.round((summary.totalHours / maxHours) * 100));
          const targetPercent = Math.min(100, Math.round((summary.targetHours / maxHours) * 100));

          return (
            <div key={summary.date} className="flex flex-col items-center h-full justify-end group relative">
              {/* Tooltip on hover */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#292747] text-white text-[10px] font-bold px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-20">
                {summary.totalHours}h / {summary.targetHours}h
              </div>

              {/* Bar track container */}
              <div className="w-full max-w-[36px] bg-[#E9E3FF]/40 rounded-t-xl h-full flex items-end relative overflow-hidden">
                {/* Target line indicator */}
                <div
                  className="absolute left-0 right-0 border-b-2 border-dashed border-[#7775E8] z-10 pointer-events-none"
                  style={{ bottom: `${targetPercent}%` }}
                />

                {/* Filled bar */}
                <div
                  className={`w-full rounded-t-xl transition-all duration-500 ${
                    summary.targetMet
                      ? 'bg-gradient-to-t from-[#00875A] to-[#BDEBD9]'
                      : 'bg-gradient-to-t from-[#7775E8] to-[#9B8AFB]'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              {/* Day label */}
              <span className="text-[11px] font-medium text-[#8885A5] mt-2">
                {formatDate(summary.date, 'EEE')}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
