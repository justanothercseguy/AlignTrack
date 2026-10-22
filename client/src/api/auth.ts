import client from './client';
import { User } from '../types';

export const registerApi = async (data: any) => {
  const res = await client.post('/auth/register', data);
  return res.data;
};

export const loginApi = async (data: any) => {
  const res = await client.post('/auth/login', data);
  return res.data;
};

export const getMeApi = async (): Promise<{ user: User }> => {
  const res = await client.get('/auth/me');
  return res.data.data;
};

export const updateProfileApi = async (data: any) => {
  const res = await client.put('/auth/profile', data);
  return res.data.data;
};

export const changePasswordApi = async (data: any) => {
  const res = await client.post('/auth/change-password', data);
  return res.data;
};

export const deleteAccountApi = async () => {
  const res = await client.delete('/auth/account');
  return res.data;
};
