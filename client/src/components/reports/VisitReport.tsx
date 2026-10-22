import React from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../utils/dates';
import { getCategoryLabel } from '../../utils/formatters';
import { Printer, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

interface VisitReportProps {
  reportData: any;
}

export const VisitReport: React.FC<VisitReportProps> = ({ reportData }) => {
  if (!reportData) return null;

  const handlePrint = () => {
    window.print();
  };

  const {
    patientName,
    appointment,
    currentAligner,
    alignerHistory,
    wearTimeSummary,
    issuesForDiscussion,
    questionsToAsk,
    generatedAt,
  } = reportData;

  return (
    <div className="space-y-6">
      {/* Top action bar (hidden on print) */}
      <div className="flex items-center justify-between no-print bg-white p-4 rounded-2xl border border-[#E9E3FF] shadow-sm">
        <div>
          <h3 className="font-bold text-[#292747] text-base">Orthodontist Preparation Report</h3>
          <p className="text-xs text-[#8885A5]">Ready for review or printing for your appointment</p>
        </div>
        <Button variant="primary" size="md" onClick={handlePrint} className="flex items-center gap-2">
          <Printer size={16} />
          <span>Print / Export PDF</span>
        </Button>
      </div>

      {/* Main Printable Document Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E9E3FF] shadow-sm print:shadow-none print:border-none print:p-0 print:m-0">
        {/* Document Header */}
        <div className="border-b-2 border-[#292747] pb-4 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#7775E8]">
              AlignTrack • Patient Summary
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#292747] mt-1">
              Clear Aligner Visit Report
            </h1>
            <p className="text-xs text-[#8885A5] mt-1">Patient: <strong>{patientName}</strong></p>
          </div>
          <div className="text-left sm:text-right text-xs text-[#8885A5]">
            <p>Generated: {formatDate(generatedAt, 'MMM d, yyyy h:mm a')}</p>
            {appointment && (
              <p className="font-semibold text-[#292747] mt-0.5">
                Target Visit: {formatDate(appointment.date)} {appointment.time && `at ${appointment.time}`}
              </p>
            )}
          </div>
        </div>

        {/* Clinical Disclaimer */}
        <div className="p-3 bg-[#F8F7FF] rounded-xl border border-[#E9E3FF] mb-6 text-[11px] text-[#8885A5] leading-relaxed">
          <strong className="text-[#292747]">Notice:</strong> This report contains patient-recorded wear-time logs, symptom notes, and questions. It is an organization aid and does not constitute a clinical assessment or readiness recommendation.
        </div>

        {/* Section 1: Current Aligner & Wear Time Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#F8F7FF] p-4 rounded-2xl border border-[#E9E3FF]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7775E8] mb-3">
              1. Current Aligner Status
            </h2>
            {currentAligner ? (
              <div className="space-y-1.5 text-xs">
                <p><strong>Current Set:</strong> Set {currentAligner.setNumber}</p>
                <p><strong>Actual Start Date:</strong> {formatDate(currentAligner.actualStartDate || currentAligner.plannedStartDate)}</p>
                <p><strong>Planned Duration:</strong> {currentAligner.plannedDurationDays} days</p>
                <p><strong>Planned Change Date:</strong> {formatDate(currentAligner.plannedChangeDate)}</p>
                <p><strong>Elapsed Wear:</strong> {currentAligner.daysElapsed || 0} days</p>
              </div>
            ) : (
              <p className="text-xs text-[#8885A5]">No active set currently recorded.</p>
            )}
          </div>

          <div className="bg-[#F8F7FF] p-4 rounded-2xl border border-[#E9E3FF]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7775E8] mb-3">
              2. 14-Day Wear Time Adherence
            </h2>
            {wearTimeSummary && (
              <div className="space-y-1.5 text-xs">
                <p><strong>Average Wear Time:</strong> {wearTimeSummary.averageDailyHours} hours / day</p>
                <p><strong>Days Tracked:</strong> {wearTimeSummary.daysTracked} of {wearTimeSummary.totalDaysInRange} days</p>
                <p><strong>Target Met Compliance:</strong> {wearTimeSummary.targetMetPercentage}%</p>
                {wearTimeSummary.incompleteData && (
                  <p className="text-[11px] text-[#BF2600] flex items-center gap-1 font-semibold mt-2">
                    <AlertCircle size={12} />
                    Incomplete Wear Logs: User did not log every day in this range.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Aligner Set History Table */}
        <div className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7775E8] mb-3">
            3. Treatment Sets & History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#E9E3FF] rounded-xl overflow-hidden">
              <thead className="bg-[#E9E3FF]/60 text-[#292747] font-bold">
                <tr>
                  <th className="p-2.5">Set #</th>
                  <th className="p-2.5">Prescribed</th>
                  <th className="p-2.5">Actual Start</th>
                  <th className="p-2.5">Planned End</th>
                  <th className="p-2.5">Actual End</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E3FF]">
                {alignerHistory && alignerHistory.map((s: any) => (
                  <tr key={s._id} className={s.status === 'current' ? 'bg-[#F8F7FF] font-semibold' : ''}>
                    <td className="p-2.5">Set {s.setNumber}</td>
                    <td className="p-2.5">{s.plannedDurationDays}d</td>
                    <td className="p-2.5">{formatDate(s.actualStartDate) || '—'}</td>
                    <td className="p-2.5">{formatDate(s.plannedChangeDate) || '—'}</td>
                    <td className="p-2.5">{formatDate(s.actualChangeDate) || '—'}</td>
                    <td className="p-2.5 capitalize">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Issues & Symptoms to Discuss */}
        <div className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7775E8] mb-3">
            4. Reported Issues & Symptoms for Discussion ({issuesForDiscussion?.length || 0})
          </h2>
          {issuesForDiscussion && issuesForDiscussion.length > 0 ? (
            <div className="space-y-3">
              {issuesForDiscussion.map((issue: any) => (
                <div key={issue._id} className="p-3 bg-[#F8F7FF] rounded-xl border border-[#E9E3FF] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#292747]">
                      {getCategoryLabel(issue.category)} ({issue.severity})
                    </span>
                    <span className="text-[#8885A5]">{formatDate(issue.date)}</span>
                  </div>
                  {issue.affectedArea && <p className="text-[#7775E8] font-semibold mb-1">Area: {issue.affectedArea}</p>}
                  <p className="text-[#292747]">{issue.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8885A5] italic">No active symptoms or issues flagged for this visit.</p>
          )}
        </div>

        {/* Section 4: Questions to Ask */}
        <div className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7775E8] mb-3">
            5. Questions for Doctor ({questionsToAsk?.length || 0})
          </h2>
          {questionsToAsk && questionsToAsk.length > 0 ? (
            <div className="space-y-2">
              {questionsToAsk.map((q: any, idx: number) => (
                <div key={q._id} className="p-3 bg-[#F8F7FF] rounded-xl border border-[#E9E3FF] text-xs flex items-start gap-2.5">
                  <span className="font-bold text-[#7775E8]">{idx + 1}.</span>
                  <div className="flex-1">
                    <p className="font-semibold text-[#292747]">{q.text}</p>
                    <div className="mt-2 border-b border-dashed border-[#8885A5]/40 h-6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8885A5] italic">No specific questions logged.</p>
          )}
        </div>

        {/* Section 5: Doctor Notes and Instructions (Handwritten or Printed) */}
        <div className="border border-[#E9E3FF] rounded-2xl p-4 bg-[#F8F7FF]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7775E8] mb-2">
            6. Orthodontist Notes & Next Steps
          </h2>
          <div className="space-y-4 pt-2">
            <div className="border-b border-[#E9E3FF] h-6" />
            <div className="border-b border-[#E9E3FF] h-6" />
            <div className="border-b border-[#E9E3FF] h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
