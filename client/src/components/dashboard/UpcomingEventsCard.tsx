import React from 'react';
import { Card } from '../ui/Card';
import { CalendarEvent } from '../../types';
import { formatDate } from '../../utils/dates';
import { NavLink } from 'react-router-dom';
import { Calendar as CalendarIcon, ArrowRight } from 'lucide-react';

interface UpcomingEventsCardProps {
  events: CalendarEvent[];
}

export const UpcomingEventsCard: React.FC<UpcomingEventsCardProps> = ({ events }) => {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#292747] text-base">Upcoming Schedule</h3>
        <NavLink to="/calendar" className="text-xs font-semibold text-[#7775E8] hover:underline flex items-center gap-1">
          Full Calendar <ArrowRight size={13} />
        </NavLink>
      </div>

      {events.length === 0 ? (
        <div className="p-6 text-center bg-[#F8F7FF] rounded-2xl border border-dashed border-[#E9E3FF]">
          <CalendarIcon className="mx-auto text-[#8885A5] mb-2" size={24} />
          <p className="text-xs text-[#8885A5]">No upcoming events for the rest of this month.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {events.slice(0, 5).map((ev) => (
            <div
              key={ev.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7FF] border border-[#E9E3FF] text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: ev.color }}
                />
                <span className="font-medium text-[#292747] truncate">{ev.title}</span>
              </div>
              <span className="text-[#8885A5] font-semibold shrink-0 ml-2">
                {formatDate(ev.date, 'MMM d')}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
