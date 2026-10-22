import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarEvent } from '../../types';

interface CalendarViewProps {
  events: CalendarEvent[];
  onDateClick: (dateStr: string) => void;
  onEventClick: (event: any) => void;
  onDatesSet: (arg: any) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onDateClick,
  onEventClick,
  onDatesSet,
}) => {
  const calendarRef = useRef<FullCalendar>(null);

  const formattedEvents = events.map((ev) => ({
    id: ev.id,
    title: ev.title,
    start: ev.date + (ev.time ? `T${ev.time}:00` : ''),
    backgroundColor: ev.color,
    borderColor: ev.color,
    textColor: '#292747',
    extendedProps: ev.details,
  }));

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#E9E3FF] shadow-sm custom-fullcalendar">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listMonth',
        }}
        events={formattedEvents}
        dateClick={(info) => onDateClick(info.dateStr)}
        eventClick={(info) => onEventClick(info.event)}
        datesSet={onDatesSet}
        height="auto"
        aspectRatio={1.5}
        editable={false}
        selectable={true}
        dayMaxEvents={3}
      />
    </div>
  );
};
