import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/auth/refresh`,
            { refreshToken }
          );
          localStorage.setItem("accessToken", data.accessToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios(error.config);
        } catch {
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData)        => api.post("/auth/register", userData),
  login:    (email, password) => api.post("/auth/login", { email, password }),
  refresh:  (refreshToken)    => api.post("/auth/refresh", { refreshToken }),
  getMe:    ()                => api.get("/auth/me"),
  logout:   ()                => api.post("/auth/logout"),
};

export const sessionAPI = {
  getMySessions: ()     => api.get("/sessions/my"),
  getAllSessions: ()     => api.get("/sessions"),
  getById:       (id)   => api.get(`/sessions/${id}`),
  create:        (data) => api.post("/sessions", data),
  stopSession:   (id)   => api.patch(`/sessions/${id}/stop`),
  getLogs:       (id)   => api.get(`/sessions/${id}/logs`),
  getSnapshots:  (id)   => api.get(`/sessions/${id}/snapshots`),
  getAnalytics:  (id)   => api.get(`/sessions/${id}/analytics`),
  sendAlert:     (id, data) => api.post(`/sessions/${id}/alert`, data),
};

export const videoAPI = {
  upload: (sessionId, videoFile) => {
    const formData = new FormData();
    formData.append("video", videoFile);
    return api.post(`/video/upload/${sessionId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  process: (sessionId) => api.post(`/video/process/${sessionId}`),
};

export const reportAPI = {
  downloadReport: (sessionId) =>
    api.get(`/report/${sessionId}`, { responseType: "blob" }),
};

export const exportAPI = {
  exportCSV:   (sessionId) =>
    api.get(`/export/${sessionId}/csv`,   { responseType: "blob" }),
  exportExcel: (sessionId) =>
    api.get(`/export/${sessionId}/excel`, { responseType: "blob" }),
};

export default api;
