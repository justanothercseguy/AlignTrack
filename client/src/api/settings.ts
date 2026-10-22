import client from './client';

export const getSettingsApi = async () => {
  const res = await client.get('/settings');
  return res.data.data;
};

export const updateTreatmentSettingsApi = async (data: any) => {
  const res = await client.put('/settings/treatment', data);
  return res.data.data;
};

export const updateNotificationPreferencesApi = async (data: any) => {
  const res = await client.put('/settings/notifications', data);
  return res.data.data;
};

export const updateWearTimeSettingsApi = async (data: any) => {
  const res = await client.put('/settings/wear-time', data);
  return res.data.data;
};

export const exportDataApi = async () => {
  const res = await client.post('/settings/export', {}, { responseType: 'blob' });
  // Trigger browser download
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `aligntrack-backup-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
