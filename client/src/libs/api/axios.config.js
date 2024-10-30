// src/api/axios.js
import axios from 'axios';
console.log(import.meta.env.VITE_SERVER_API)

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_API, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add token (if available)
api.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem('user-payload'))?.auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;