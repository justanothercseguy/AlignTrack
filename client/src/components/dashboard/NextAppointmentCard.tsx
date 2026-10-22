import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Appointment } from '../../types';
import { formatDate, formatTime, getDaysCountdown } from '../../utils/dates';
import { CalendarCheck, MapPin, Clock, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface NextAppointmentCardProps {
  appointment: Appointment | null;
  onAddAppointment: () => void;
}

export const NextAppointmentCard: React.FC<NextAppointmentCardProps> = ({
  appointment,
  onAddAppointment,
}) => {
  if (!appointment) {
    return (
      <Card className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#292747] text-base">Next Orthodontist Visit</h3>
            <Badge variant="neutral">None scheduled</Badge>
          </div>
          <div className="p-5 text-center bg-[#F8F7FF] rounded-2xl border border-dashed border-[#E9E3FF] my-2">
            <CalendarCheck className="mx-auto text-[#9B8AFB] mb-2" size={28} />
            <p className="text-xs text-[#8885A5] leading-relaxed">
              No upcoming appointments. Schedule your next routine aligner review or attachment check.
            </p>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-[#E9E3FF]/60">
          <Button variant="outline" onClick={onAddAppointment} className="w-full">
            Schedule Appointment
          </Button>
        </div>
      </Card>
    );
  }

  const countdown = getDaysCountdown(appointment.date);

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#292747] text-base">Next Orthodontist Visit</h3>
          <Badge variant="peach">{countdown.text}</Badge>
        </div>

        <div className="bg-[#FFF0EB]/40 border border-[#FFD8CE] rounded-2xl p-4 mb-3">
          <h4 className="font-bold text-base text-[#292747] mb-1">{appointment.title}</h4>
          {appointment.provider && (
            <p className="text-xs font-semibold text-[#7775E8] mb-2">{appointment.provider}</p>
          )}

          <div className="space-y-1.5 text-xs text-[#8885A5]">
            <div className="flex items-center gap-2">
              <CalendarCheck size={14} className="text-[#DE350B]" />
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
              <div className="flex items-center gap-2 text-[#8885A5]">
                <MapPin size={14} className="shrink-0" />
                <span className="truncate">{appointment.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#E9E3FF]/60 flex items-center justify-between gap-3">
        <NavLink
          to={`/reports?appointmentId=${appointment._id}`}
          className="text-xs font-semibold text-[#7775E8] hover:underline flex items-center gap-1"
        >
          Prepare Visit Report <ArrowRight size={13} />
        </NavLink>
        <NavLink to="/appointments" className="text-xs font-medium text-[#8885A5] hover:text-[#292747]">
          View details
        </NavLink>
      </div>
    </Card>
  );
};
