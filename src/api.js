// src/api.js
import axios from 'axios';

const api = axios.create({
//    baseURL: 'http://localhost:8080',
    baseURL: 'https://pluscare-app.onrender.com'
});

// Request Interceptor: Add token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle expired/invalid token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message === "Invalid token" && error.response.status === 401) {
      // Token is invalid/expired: auto logout
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      window.location.href = '/'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;
