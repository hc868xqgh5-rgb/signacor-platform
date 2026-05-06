import axios from 'axios';

const api = axios.create({
<<<<<<< HEAD
  baseURL: '/api',
=======
  baseURL: 'https://signacor-api.onrender.com/api',
>>>>>>> 92d9217743a805f7dde9d718392ab63cc36c3be3
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('signacore_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('signacore_token');
      localStorage.removeItem('signacore_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
