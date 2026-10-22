import client from './client';
import { WearSession, DailyWearSummary } from '../types';

export const startWearSessionApi = async (data?: { timezone?: string; startTime?: string }): Promise<WearSession> => {
  const res = await client.post('/wear-sessions/start', data || {});
  return res.data.data;
};

export const stopWearSessionApi = async (data?: {
  endTime?: string;
  startTime?: string;
}): Promise<{ session: WearSession; dailySummary: DailyWearSummary }> => {
  const res = await client.post('/wear-sessions/stop', data || {});
  return res.data.data;
};

export const getActiveWearSessionApi = async (): Promise<WearSession | null> => {
  const res = await client.get('/wear-sessions/active');
  return res.data.data;
};

export const addManualWearSessionApi = async (data: {
  startTime: string;
  endTime: string;
  timezone?: string;
  alignerSetId?: string;
}): Promise<WearSession> => {
  const res = await client.post('/wear-sessions/manual', data);
  return res.data.data;
};

export const listWearSessionsApi = async (params?: { date?: string; alignerSetId?: string }): Promise<WearSession[]> => {
  const res = await client.get('/wear-sessions', { params });
  return res.data.data;
};

export const editWearSessionApi = async (id: string, data: Partial<WearSession>): Promise<WearSession> => {
  const res = await client.put(`/wear-sessions/${id}`, data);
  return res.data.data;
};

export const deleteWearSessionApi = async (id: string) => {
  const res = await client.delete(`/wear-sessions/${id}`);
  return res.data;
};

export const getDailyWearSummaryApi = async (date?: string): Promise<DailyWearSummary> => {
  const res = await client.get('/wear-sessions/daily-summary', { params: { date } });
  return res.data.data;
};

export const getWeeklyWearSummaryApi = async (): Promise<DailyWearSummary[]> => {
  const res = await client.get('/wear-sessions/weekly-summary');
  return res.data.data;
};

export const getPeriodWearSummaryApi = async (startDate: string, endDate: string): Promise<DailyWearSummary[]> => {
  const res = await client.get('/wear-sessions/summary', { params: { startDate, endDate } });
  return res.data.data;
};
