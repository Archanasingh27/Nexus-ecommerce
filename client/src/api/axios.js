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

// Add auth token to every request if available
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('nexus_user_info');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
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
      localStorage.removeItem('nexus_user_info');
    }
    return Promise.reject(error);
  }
);

export default api;
