import React from 'react';
import { Card } from '../ui/Card';
import { Clock, PlusCircle, CalendarPlus, CheckSquare, Sparkles } from 'lucide-react';

interface QuickActionsCardProps {
  onLogWearTime: () => void;
  onAddIssue: () => void;
  onAddAppointment: () => void;
  onConfirmChange: () => void;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onLogWearTime,
  onAddIssue,
  onAddAppointment,
  onConfirmChange,
}) => {
  const actions = [
    {
      title: 'Manual Wear Time',
      desc: 'Log missed session',
      icon: Clock,
      color: 'bg-[#E9E3FF] text-[#5A54C7]',
      onClick: onLogWearTime,
    },
    {
      title: 'Log Symptom',
      desc: 'Pain, fit, or concern',
      icon: PlusCircle,
      color: 'bg-[#FFE8E5] text-[#BF2600]',
      onClick: onAddIssue,
    },
    {
      title: 'Add Appointment',
      desc: 'Upcoming clinic visit',
      icon: CalendarPlus,
      color: 'bg-[#FFF0EB] text-[#DE350B]',
      onClick: onAddAppointment,
    },
    {
      title: 'Confirm Aligner Switch',
      desc: 'Record actual change',
      icon: CheckSquare,
      color: 'bg-[#E6F7F0] text-[#00875A]',
      onClick: onConfirmChange,
    },
  ];

  return (
    <Card className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-[#9B8AFB]" />
        <h3 className="font-semibold text-[#292747] text-base">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.title}
              onClick={act.onClick}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#F8F7FF] border border-[#E9E3FF] hover:border-[#9B8AFB] hover:shadow-sm hover:bg-white transition-all text-center group"
            >
              <div className={`w-11 h-11 rounded-2xl ${act.color} flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105`}>
                <Icon size={20} />
              </div>
              <span className="text-xs font-bold text-[#292747] leading-tight mb-0.5">{act.title}</span>
              <span className="text-[11px] text-[#8885A5] line-clamp-1">{act.desc}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
};
