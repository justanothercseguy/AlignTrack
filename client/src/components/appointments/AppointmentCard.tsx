import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Appointment } from '../../types';
import { formatDate, formatTime, getDaysCountdown } from '../../utils/dates';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, RefreshCw, FileText } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface AppointmentCardProps {
  appointment: Appointment;
  onReschedule: (appointment: Appointment) => void;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onReschedule,
  onCancel,
  onComplete,
}) => {
  const isUpcoming = appointment.status === 'upcoming';
  const countdown = getDaysCountdown(appointment.date);

  const getStatusBadge = () => {
    switch (appointment.status) {
      case 'upcoming':
        return <Badge variant="peach">{countdown.text}</Badge>;
      case 'completed':
        return <Badge variant="mint">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="neutral">Cancelled</Badge>;
      case 'rescheduled':
        return <Badge variant="lavender">Rescheduled</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base text-[#292747]">{appointment.title}</h3>
          {getStatusBadge()}
        </div>

        {appointment.provider && (
          <p className="text-xs font-semibold text-[#7775E8] mb-2">{appointment.provider}</p>
        )}

        <div className="space-y-1.5 text-xs text-[#8885A5] mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[#DE350B]" />
            <span className="font-medium text-[#292747]">{formatDate(appointment.date)}</span>
            {appointment.time && (
              <>
                <span className="text-[#D4CCFF]">•</span>
                <div className="flex items-center gap-1">
                  <Clock size={13} />
                  <span>{formatTime(appointment.time)}</span>
                </div>
              </>
            )}
          </div>

          {appointment.location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="shrink-0" />
              <span>{appointment.location}</span>
            </div>
          )}
        </div>

        {appointment.notes && (
          <p className="text-xs text-[#8885A5] bg-[#F8F7FF] p-3 rounded-xl border border-[#E9E3FF] mb-3">
            "{appointment.notes}"
          </p>
        )}

        {appointment.postAppointmentNotes && (
          <div className="p-3 bg-[#E6F7F0] border border-[#BDEBD9] rounded-xl text-xs text-[#00875A] mb-3">
            <span className="font-bold block mb-0.5">Post-Visit Summary:</span>
            {appointment.postAppointmentNotes}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="pt-3 border-t border-[#E9E3FF]/60 flex flex-wrap items-center justify-between gap-2">
        <NavLink
          to={`/reports?appointmentId=${appointment._id}`}
          className="text-xs font-semibold text-[#7775E8] hover:underline flex items-center gap-1"
        >
          <FileText size={13} /> Visit Report
        </NavLink>

        {isUpcoming && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onComplete(appointment._id)}
              className="p-1.5 text-[#00875A] hover:bg-[#E6F7F0] rounded-lg transition-colors"
              title="Mark Completed"
            >
              <CheckCircle size={16} />
            </button>
            <button
              onClick={() => onReschedule(appointment)}
              className="p-1.5 text-[#7775E8] hover:bg-[#E9E3FF] rounded-lg transition-colors"
              title="Reschedule"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => onCancel(appointment._id)}
              className="p-1.5 text-[#D32F2F] hover:bg-[#FFE8E5] rounded-lg transition-colors"
              title="Cancel Appointment"
            >
              <XCircle size={16} />
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};
