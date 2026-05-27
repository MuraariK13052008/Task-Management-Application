import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => apiClient.post("/auth/register", data),
  login: (data) => apiClient.post("/auth/login", data),
  me: () => apiClient.get("/auth/me"),
};

// Tasks API
export const tasksAPI = {
  getAll: (params) => apiClient.get("/tasks", { params }),
  getById: (id) => apiClient.get(`/tasks/${id}`),
  getStats: () => apiClient.get("/tasks/stats"),
  create: (data) => apiClient.post("/tasks", data),
  update: (id, data) => apiClient.put(`/tasks/${id}`, data),
  delete: (id) => apiClient.delete(`/tasks/${id}`),
  addComment: (id, data) => apiClient.post(`/tasks/${id}/comments`, data),
};

export default apiClient;
