import axios from 'axios';

const api = axios.create({
  baseURL: 'https://127.0.0.1:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  verifyToken: async () => {
    const response = await api.post('/auth/verify-token');
    return response.data;
  },
  
  connectGmail: async () => {
    const response = await api.get('/auth/gmail/connect');
    return response.data;
  },
  
  connectMicrosoft: async () => {
    const response = await api.get('/auth/microsoft/connect');
    return response.data;
  },
  
  fetchEmails: async (params = {}) => {
    const response = await api.get('/auth/fetch_emails', { params });
    return response.data;
  },
  
  getEmailDetail: async (emailId) => {
    const response = await api.get(`/auth/email/${emailId}`);
    return response.data;
  }
};

export default api;