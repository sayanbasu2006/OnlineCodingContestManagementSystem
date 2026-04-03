import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Hardcoded for demo/MVP
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`; // The backend configures `@jwt_required()`
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto-logout if token expires
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally could prompt a reload or redirect
    }
    return Promise.reject(error);
  }
);

export default api;
