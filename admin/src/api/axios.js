import axios from 'axios';

// When deployed to production (e.g. Vercel), use VITE_API_URL. In localhost dev, fallback to '/api' (proxied by Vite)
const baseURL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const adminInfo = localStorage.getItem('nexus_admin_info');
    if (adminInfo) {
      const parsed = JSON.parse(adminInfo);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear stale token if unauthorized (e.g. after re-seeding)
      localStorage.removeItem('nexus_admin_info');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
