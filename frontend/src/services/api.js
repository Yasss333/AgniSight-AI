import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('btp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Logic handled in AuthContext but we could trigger an event here
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
};

export const sessionAPI = {
  startSession: (params) => api.post('/session/start', params),
  stopSession: (id) => api.post(`/session/stop/${id}`),
  getSessions: () => api.get('/session'),
  getSessionLogs: (id) => api.get(`/session/${id}/logs`),
};

export const reportAPI = {
  getReports: () => api.get('/report'),
  downloadReport: (id) => api.get(`/report/${id}`, { responseType: 'blob' }),
};

export const exportAPI = {
  exportCSV: (id) => api.get(`/export/${id}/csv`, { responseType: 'blob' }),
  exportExcel: (id) => api.get(`/export/${id}/xlsx`, { responseType: 'blob' }),
};

export const videoAPI = {
  uploadVideo: (formData) => api.post('/video/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export default api;
