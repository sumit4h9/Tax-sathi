import axios from 'axios';

// Browser: same-origin /api (proxied to Laravel in next.config.mjs). Avoids CORS.
const baseURL =
  typeof window !== 'undefined'
    ? '/api'
    : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data;
    const firstFieldError =
      data?.errors && typeof data.errors === 'object'
        ? Object.values(data.errors).flat()?.[0]
        : null;

    error.friendlyMessage =
      (typeof data?.hint === 'string' && data.hint) ||
      (typeof data?.message === 'string' && data.message) ||
      (typeof firstFieldError === 'string' && firstFieldError) ||
      error.message;

    return Promise.reject(error);
  }
);

export default api;