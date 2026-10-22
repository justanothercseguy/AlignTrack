import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { WearSession } from '../../types';
import { formatDate, formatTime } from '../../utils/dates';
import { formatHoursMinutes } from '../../utils/formatters';
import { Clock, Trash2, AlertCircle } from 'lucide-react';

interface SessionListProps {
  sessions: WearSession[];
  onDeleteSession: (id: string) => void;
}

export const SessionList: React.FC<SessionListProps> = ({ sessions, onDeleteSession }) => {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#292747] text-base">Wear Sessions Log</h3>
        <span className="text-xs text-[#8885A5]">{sessions.length} sessions</span>
      </div>

      {sessions.length === 0 ? (
        <div className="p-8 text-center bg-[#F8F7FF] rounded-2xl border border-dashed border-[#E9E3FF]">
          <Clock className="mx-auto text-[#8885A5] mb-2" size={24} />
          <p className="text-xs text-[#8885A5]">No sessions recorded yet for this period.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#E9E3FF]/60">
          {sessions.map((session) => {
            const start = new Date(session.startTime);
            const end = session.endTime ? new Date(session.endTime) : null;
            const durationMins = end
              ? Math.round((end.getTime() - start.getTime()) / 60000)
              : Math.round((new Date().getTime() - start.getTime()) / 60000);

            return (
              <div key={session._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#E9E3FF] flex items-center justify-center text-[#7775E8] shrink-0 font-bold">
                    {session.source === 'timer' ? '⏱️' : '📝'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#292747]">
                        {formatDate(session.startTime, 'MMM d, yyyy')}
                      </span>
                      {session.flaggedForReview && (
                        <span className="text-[10px] bg-[#FFE8E5] text-[#BF2600] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <AlertCircle size={10} /> Needs Review
                        </span>
                      )}
                      {session.isActive && (
                        <span className="text-[10px] bg-[#E6F7F0] text-[#00875A] px-2 py-0.5 rounded-full font-semibold animate-pulse">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[#8885A5] mt-0.5">
                      {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {end ? ` – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ' – Ongoing'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-sm text-[#292747]">
                    {formatHoursMinutes(durationMins)}
                  </span>
                  <button
                    onClick={() => onDeleteSession(session._id)}
                    className="p-1.5 text-[#8885A5] hover:text-[#D32F2F] hover:bg-[#FFE8E5] rounded-lg transition-colors"
                    title="Delete session"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
