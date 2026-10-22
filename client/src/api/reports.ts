import client from './client';
import { TreatmentSummary } from '../types';

export const getVisitReportApi = async (appointmentId?: string) => {
  const params: any = {};
  if (appointmentId) params.appointmentId = appointmentId;
  const res = await client.get('/reports/visit-report', { params });
  return res.data.data;
};

export const getTreatmentSummaryApi = async (): Promise<TreatmentSummary> => {
  const res = await client.get('/reports/treatment-summary');
  return res.data.data;
};

export const getWearTimeReportApi = async (startDate: string, endDate: string) => {
  const res = await client.get('/reports/wear-time-report', { params: { startDate, endDate } });
  return res.data.data;
};
