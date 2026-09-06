import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// Interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, can handle automatic logout if not on auth pages
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Optional auto cleanup
    }
    return Promise.reject(error);
  }
);

export default api;
