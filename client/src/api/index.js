import axios from 'axios';
import useAuthStore from '../store/authStore';
const apiUrl = import.meta.env.VITE_API_URL;

const API_URL = `${apiUrl}/api`;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
