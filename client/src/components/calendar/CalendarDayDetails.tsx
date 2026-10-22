import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CalendarEvent } from '../../types';
import { formatDate } from '../../utils/dates';
import { Calendar, Plus, X } from 'lucide-react';

interface CalendarDayDetailsProps {
  date: string | null;
  events: CalendarEvent[];
  onClose: () => void;
  onAddAppointment: (date: string) => void;
  onAddIssue: (date: string) => void;
}

export const CalendarDayDetails: React.FC<CalendarDayDetailsProps> = ({
  date,
  events,
  onClose,
  onAddAppointment,
  onAddIssue,
}) => {
  if (!date) return null;

  return (
    <Card className="border-2 border-[#9B8AFB]/50 shadow-md">
      <div className="flex items-center justify-between pb-3 border-b border-[#E9E3FF] mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[#9B8AFB]" />
          <h3 className="font-bold text-[#292747] text-base">{formatDate(date, 'EEEE, MMMM d, yyyy')}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-[#8885A5] hover:text-[#292747] hover:bg-[#F8F7FF]"
        >
          <X size={18} />
        </button>
      </div>

      {events.length === 0 ? (
        <p className="text-xs text-[#8885A5] italic py-3">No events scheduled for this date.</p>
      ) : (
        <div className="space-y-2 mb-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="p-3 rounded-xl border border-[#E9E3FF] bg-[#F8F7FF] flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: ev.color }}
                />
                <span className="font-bold text-[#292747]">{ev.title}</span>
              </div>
              {ev.time && <span className="text-[#8885A5] font-medium">{ev.time}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Quick adds for selected date */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E9E3FF]/60">
        <Button variant="secondary" size="sm" onClick={() => onAddAppointment(date)}>
          <Plus size={14} className="mr-1" /> Add Appointment
        </Button>
        <Button variant="outline" size="sm" onClick={() => onAddIssue(date)}>
          <Plus size={14} className="mr-1" /> Log Symptom
        </Button>
      </div>
    </Card>
  );
};
