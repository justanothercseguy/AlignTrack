import axios from 'axios';

let envApi = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Remove trailing slashes
envApi = envApi.replace(/\/+$/, '');
// Ensure it points to /api
const API_BASE = envApi.endsWith('/api') ? envApi : `${envApi}/api`;

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Bearer token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('aligntrack_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401s
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('aligntrack_token');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
