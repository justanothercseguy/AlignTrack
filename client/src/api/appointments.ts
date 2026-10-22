import client from './client';
import { Appointment } from '../types';

export const listAppointmentsApi = async (status?: string): Promise<Appointment[]> => {
  const params: any = {};
  if (status) params.status = status;
  const res = await client.get('/appointments', { params });
  return res.data.data;
};

export const getAppointmentApi = async (id: string): Promise<Appointment> => {
  const res = await client.get(`/appointments/${id}`);
  return res.data.data;
};

export const createAppointmentApi = async (data: Partial<Appointment>): Promise<Appointment> => {
  const res = await client.post('/appointments', data);
  return res.data.data;
};

export const updateAppointmentApi = async (id: string, data: Partial<Appointment>): Promise<Appointment> => {
  const res = await client.put(`/appointments/${id}`, data);
  return res.data.data;
};

export const rescheduleAppointmentApi = async (id: string, data: { date: string; time?: string; reason?: string }) => {
  const res = await client.put(`/appointments/${id}/reschedule`, data);
  return res.data.data;
};

export const cancelAppointmentApi = async (id: string) => {
  const res = await client.put(`/appointments/${id}/cancel`);
  return res.data.data;
};

export const completeAppointmentApi = async (id: string, postAppointmentNotes?: string) => {
  const res = await client.put(`/appointments/${id}/complete`, { postAppointmentNotes });
  return res.data.data;
};

export const deleteAppointmentApi = async (id: string) => {
  const res = await client.delete(`/appointments/${id}`);
  return res.data;
};
