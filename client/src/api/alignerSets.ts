import client from './client';
import { AlignerSet } from '../types';

export const listAlignerSetsApi = async (status?: string): Promise<AlignerSet[]> => {
  const params: any = {};
  if (status) params.status = status;
  const res = await client.get('/aligner-sets', { params });
  return res.data.data;
};

export const getAlignerSetApi = async (id: string): Promise<AlignerSet> => {
  const res = await client.get(`/aligner-sets/${id}`);
  return res.data.data;
};

export const createAlignerSetApi = async (data: Partial<AlignerSet>): Promise<AlignerSet> => {
  const res = await client.post('/aligner-sets', data);
  return res.data.data;
};

export const updateAlignerSetApi = async (id: string, data: Partial<AlignerSet> & { recalculateFuture?: boolean }): Promise<AlignerSet> => {
  const res = await client.put(`/aligner-sets/${id}`, data);
  return res.data.data;
};

export const deleteAlignerSetApi = async (id: string) => {
  const res = await client.delete(`/aligner-sets/${id}`);
  return res.data;
};

export const confirmAlignerChangeApi = async (
  id: string,
  data: {
    actualChangeDate: string;
    nextSetNumber?: number;
    nextSetPlannedDuration?: number;
    nextSetActualStartDate?: string;
  }
) => {
  const res = await client.post(`/aligner-sets/${id}/confirm-change`, data);
  return res.data.data;
};

export const generatePlanApi = async (data: { startDate: string; totalSets: number }): Promise<AlignerSet[]> => {
  const res = await client.post('/aligner-sets/generate-plan', data);
  return res.data.data;
};

export const recalculateFutureSetsApi = async (id: string): Promise<AlignerSet[]> => {
  const res = await client.put(`/aligner-sets/${id}/recalculate`);
  return res.data.data;
};
