import React, { useState, useEffect } from 'react';
import { CalendarView } from '../components/calendar/CalendarView';
import { CalendarDayDetails } from '../components/calendar/CalendarDayDetails';
import { EventLegend } from '../components/calendar/EventLegend';
import { Modal } from '../components/ui/Modal';
import { AppointmentForm } from '../components/appointments/AppointmentForm';
import { IssueForm } from '../components/journal/IssueForm';
import { Button } from '../components/ui/Button';
import { getCalendarEventsApi } from '../api/calendar';
import { createAppointmentApi } from '../api/appointments';
import { createJournalEntryApi } from '../api/journal';
import { CalendarEvent } from '../types';
import { CalendarPlus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [currentMonthStr, setCurrentMonthStr] = useState<string>('');

  // Modals
  const [isAddApptOpen, setIsAddApptOpen] = useState(false);
  const [isAddIssueOpen, setIsAddIssueOpen] = useState(false);
  const [targetDateForForm, setTargetDateForForm] = useState<string>('');

  const fetchEvents = async (month?: string) => {
    try {
      const data = await getCalendarEventsApi(month);
      setEvents(data);
      if (selectedDate) {
        setSelectedDayEvents(data.filter((e) => e.date === selectedDate));
      }
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedDayEvents(events.filter((e) => e.date === dateStr));
  };

  const handleDatesSet = (arg: any) => {
    const month = arg.view.currentStart.toISOString().slice(0, 7);
    if (month !== currentMonthStr) {
      setCurrentMonthStr(month);
      fetchEvents(month);
    }
  };

  const handleOpenAddAppt = (date?: string) => {
    setTargetDateForForm(date || selectedDate || '');
    setIsAddApptOpen(true);
  };

  const handleOpenAddIssue = (date?: string) => {
    setTargetDateForForm(date || selectedDate || '');
    setIsAddIssueOpen(true);
  };

  const handleCreateAppointment = async (payload: any) => {
    try {
      await createAppointmentApi(payload);
      toast.success('Appointment scheduled');
      setIsAddApptOpen(false);
      await fetchEvents(currentMonthStr);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create appointment');
    }
  };

  const handleCreateIssue = async (payload: any) => {
    try {
      await createJournalEntryApi(payload);
      toast.success('Symptom entry saved');
      setIsAddIssueOpen(false);
      await fetchEvents(currentMonthStr);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save symptom');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#292747]">Treatment Calendar</h2>
          <p className="text-xs text-[#8885A5]">
            Comprehensive schedule of aligner starts, planned switches, doctor visits, and milestones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleOpenAddIssue()}>
            <Plus size={14} className="mr-1" /> Log Symptom
          </Button>
          <Button variant="primary" size="sm" onClick={() => handleOpenAddAppt()}>
            <CalendarPlus size={14} className="mr-1" /> Add Appointment
          </Button>
        </div>
      </div>

      {/* Legend */}
      <EventLegend />

      {/* Calendar and Day Details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className={selectedDate ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <CalendarView
            events={events}
            onDateClick={handleDateClick}
            onEventClick={(ev) => handleDateClick(ev.startStr.slice(0, 10))}
            onDatesSet={handleDatesSet}
          />
        </div>

        {selectedDate && (
          <div className="lg:col-span-4 sticky top-24">
            <CalendarDayDetails
              date={selectedDate}
              events={selectedDayEvents}
              onClose={() => setSelectedDate(null)}
              onAddAppointment={(d) => handleOpenAddAppt(d)}
              onAddIssue={(d) => handleOpenAddIssue(d)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={isAddApptOpen} onClose={() => setIsAddApptOpen(false)} title="Schedule Appointment">
        <AppointmentForm
          defaultDate={targetDateForForm}
          onSubmit={handleCreateAppointment}
          onCancel={() => setIsAddApptOpen(false)}
        />
      </Modal>

      <Modal isOpen={isAddIssueOpen} onClose={() => setIsAddIssueOpen(false)} title="Log Symptom / Issue">
        <IssueForm
          defaultDate={targetDateForForm}
          onSubmit={handleCreateIssue}
          onCancel={() => setIsAddIssueOpen(false)}
        />
      </Modal>
    </div>
  );
};
