import React, { useState, useEffect } from 'react';
import { AppointmentCard } from '../components/appointments/AppointmentCard';
import { AppointmentForm } from '../components/appointments/AppointmentForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import {
  listAppointmentsApi,
  createAppointmentApi,
  updateAppointmentApi,
  rescheduleAppointmentApi,
  cancelAppointmentApi,
  completeAppointmentApi,
  deleteAppointmentApi,
} from '../api/appointments';
import { Appointment } from '../types';
import { CalendarCheck, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [reschedulingAppt, setReschedulingAppt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const [completingAppt, setCompletingAppt] = useState<Appointment | null>(null);
  const [postVisitNotes, setPostVisitNotes] = useState('');

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await listAppointmentsApi();
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCreate = async (payload: any) => {
    try {
      await createAppointmentApi(payload);
      toast.success('Appointment scheduled');
      setIsAddOpen(false);
      await fetchAppointments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to schedule appointment');
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingAppt) return;
    try {
      await rescheduleAppointmentApi(reschedulingAppt._id, {
        date: rescheduleDate,
        time: rescheduleTime,
        reason: rescheduleReason,
      });
      toast.success('Appointment rescheduled & reminders updated');
      setReschedulingAppt(null);
      await fetchAppointments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reschedule');
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingAppt) return;
    try {
      await completeAppointmentApi(completingAppt._id, postVisitNotes);
      toast.success('Appointment marked as completed');
      setCompletingAppt(null);
      await fetchAppointments();
    } catch (err) {
      toast.error('Failed to complete appointment');
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment? Pending reminders will be removed.')) return;
    try {
      await cancelAppointmentApi(id);
      toast.success('Appointment cancelled');
      await fetchAppointments();
    } catch (err) {
      toast.error('Failed to cancel appointment');
    }
  };

  const upcoming = appointments.filter((a) => a.status === 'upcoming');
  const past = appointments.filter((a) => a.status !== 'upcoming');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#292747]">Orthodontist Appointments</h2>
          <p className="text-xs text-[#8885A5]">
            Manage upcoming visits, reschedule when needed, and record doctor feedback
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus size={14} className="mr-1.5" /> Schedule Appointment
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck size={28} />}
          title="No appointments scheduled"
          description="Keep track of your orthodontist checkups, tracking reviews, and attachment placements."
          actionText="Schedule First Appointment"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="space-y-8">
          {/* Upcoming Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#7775E8] mb-3">
              Upcoming Visits ({upcoming.length})
            </h3>
            {upcoming.length === 0 ? (
              <p className="text-xs text-[#8885A5] italic bg-white p-4 rounded-2xl border border-[#E9E3FF]">
                No upcoming visits currently scheduled.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.map((appt) => (
                  <AppointmentCard
                    key={appt._id}
                    appointment={appt}
                    onReschedule={(a) => {
                      setReschedulingAppt(a);
                      setRescheduleDate(a.date);
                      setRescheduleTime(a.time || '10:00');
                    }}
                    onCancel={handleCancel}
                    onComplete={(id) => {
                      const found = appointments.find((a) => a._id === id);
                      if (found) setCompletingAppt(found);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Past Section */}
          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#8885A5] mb-3">
                Past Visits ({past.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-80">
                {past.map((appt) => (
                  <AppointmentCard
                    key={appt._id}
                    appointment={appt}
                    onReschedule={() => {}}
                    onCancel={() => {}}
                    onComplete={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Schedule Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Schedule Appointment">
        <AppointmentForm onSubmit={handleCreate} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={!!reschedulingAppt}
        onClose={() => setReschedulingAppt(null)}
        title="Reschedule Appointment"
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <p className="text-xs text-[#8885A5] leading-relaxed">
            Rescheduling will automatically cancel old pending reminders and schedule fresh reminders for the new date.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="New Date"
              type="date"
              required
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
            />
            <Input
              label="New Time"
              type="time"
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
            />
          </div>
          <Input
            label="Reason (Optional)"
            placeholder="e.g. Work conflict, clinic requested change"
            value={rescheduleReason}
            onChange={(e) => setRescheduleReason(e.target.value)}
          />
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E3FF]">
            <Button variant="ghost" type="button" onClick={() => setReschedulingAppt(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm Reschedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* Complete Appointment Modal */}
      <Modal
        isOpen={!!completingAppt}
        onClose={() => setCompletingAppt(null)}
        title="Mark Appointment Completed"
      >
        <form onSubmit={handleCompleteSubmit} className="space-y-4">
          <p className="text-xs text-[#8885A5]">
            Record any feedback, new aligner instructions, attachment changes, or next planned appointment dates.
          </p>
          <Textarea
            label="Post-Visit Notes"
            rows={4}
            placeholder="e.g. Doctor approved switching to 7-day changes starting Set 6. New attachments added on upper lateral incisors..."
            value={postVisitNotes}
            onChange={(e) => setPostVisitNotes(e.target.value)}
          />
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E3FF]">
            <Button variant="ghost" type="button" onClick={() => setCompletingAppt(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save & Complete
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
