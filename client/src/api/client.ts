import axios from 'axios';

// In production on Vercel, API is served from the same origin under /api
// In local dev, Vite proxy forwards /api to http://localhost:5000
let envApi = import.meta.env.VITE_API_URL || '/api';
envApi = envApi.replace(/\/+$/, '');
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
  if (token && token !== 'undefined' && token !== 'null' && config.headers) {
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
