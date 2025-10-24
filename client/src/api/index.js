import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1002/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  console.log('API Request being made to:', API_URL + config.url);
  console.log('Full config:', config);
  
  const localUserId = useAuthStore.getState().localUserId;
  if (localUserId) {
    config.headers['x-local-user-id'] = localUserId;
  }
  return config;
});

export default api;
