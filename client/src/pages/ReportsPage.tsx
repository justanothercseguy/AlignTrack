import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VisitReport } from '../components/reports/VisitReport';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { getVisitReportApi } from '../api/reports';
import { listAppointmentsApi } from '../api/appointments';
import { Appointment } from '../types';
import { formatDate } from '../../src/utils/dates';

export const ReportsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const appointmentIdFromUrl = searchParams.get('appointmentId') || '';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(appointmentIdFromUrl);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appts = await listAppointmentsApi();
        setAppointments(appts);
      } catch (err) {
        console.error('Error fetching appointments for report selector:', err);
      }
    };
    fetchAppointments();
  }, []);

  const fetchReport = async (apptId?: string) => {
    try {
      setIsLoading(true);
      const data = await getVisitReportApi(apptId || undefined);
      setReportData(data);
    } catch (err) {
      console.error('Error generating visit report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedAppointmentId);
  }, [selectedAppointmentId]);

  const appointmentOptions = [
    { value: '', label: 'General / Next Upcoming Appointment' },
    ...appointments.map((a) => ({
      value: a._id,
      label: `${a.title} (${formatDate(a.date)})`,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Selector Card (Hidden on print) */}
      <Card className="no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#292747]">Doctor Visit Report Generator</h2>
            <p className="text-xs text-[#8885A5]">
              Generate a clinical preparation summary tailored for your orthodontist visit
            </p>
          </div>
          <div className="w-full sm:w-80">
            <Select
              options={appointmentOptions}
              value={selectedAppointmentId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedAppointmentId(val);
                if (val) {
                  setSearchParams({ appointmentId: val });
                } else {
                  setSearchParams({});
                }
              }}
            />
          </div>
        </div>
      </Card>

      {/* Render Document */}
      {isLoading ? (
        <LoadingSkeleton count={4} />
      ) : (
        <VisitReport reportData={reportData} />
      )}
    </div>
  );
};
