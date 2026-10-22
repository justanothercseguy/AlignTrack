import client from './client';
import { CalendarEvent } from '../types';

export const getCalendarEventsApi = async (month?: string): Promise<CalendarEvent[]> => {
  const params: any = {};
  if (month) params.month = month;
  const res = await client.get('/calendar/events', { params });
  return res.data.data;
};
