import client from './client';
import { JournalEntry } from '../types';

export const listJournalEntriesApi = async (params?: {
  alignerSetId?: string;
  category?: string;
  severity?: string;
  unresolved?: boolean;
  needsDiscussion?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<JournalEntry[]> => {
  const res = await client.get('/journal', { params });
  return res.data.data;
};

export const getJournalEntryApi = async (id: string): Promise<JournalEntry> => {
  const res = await client.get(`/journal/${id}`);
  return res.data.data;
};

export const createJournalEntryApi = async (data: Partial<JournalEntry>): Promise<JournalEntry> => {
  const res = await client.post('/journal', data);
  return res.data.data;
};

export const updateJournalEntryApi = async (id: string, data: Partial<JournalEntry>): Promise<JournalEntry> => {
  const res = await client.put(`/journal/${id}`, data);
  return res.data.data;
};

export const deleteJournalEntryApi = async (id: string) => {
  const res = await client.delete(`/journal/${id}`);
  return res.data;
};

export const resolveJournalEntryApi = async (id: string, resolutionDate?: string) => {
  const res = await client.put(`/journal/${id}/resolve`, { resolutionDate });
  return res.data.data;
};
