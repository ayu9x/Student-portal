import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('talenttrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('talenttrack_token');
      localStorage.removeItem('talenttrack_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// Auth API
// ==========================================
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
};

// ==========================================
// Student API
// ==========================================
export const studentAPI = {
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
};

// ==========================================
// Training API
// ==========================================
export const trainingAPI = {
  getAll: (category) => api.get('/training', { params: { category } }),
  getById: (id) => api.get(`/training/${id}`),
  create: (data) => api.post('/training', data),
};

// ==========================================
// Tests API
// ==========================================
export const testsAPI = {
  getAll: (type) => api.get('/tests', { params: { type } }),
  getById: (id) => api.get(`/tests/${id}`),
  submit: (id, answers, timeTaken) => api.post(`/tests/${id}/submit`, { answers, timeTaken }),
  create: (data) => api.post('/tests', data),
};

// ==========================================
// Results API
// ==========================================
export const resultsAPI = {
  getAll: () => api.get('/results'),
  getByTestId: (testId) => api.get(`/results/${testId}`),
};

// ==========================================
// Placements API
// ==========================================
export const placementsAPI = {
  getAll: (minCgpa) => api.get('/placements', { params: { min_cgpa: minCgpa } }),
  getById: (id) => api.get(`/placements/${id}`),
  create: (data) => api.post('/placements', data),
};

// ==========================================
// Dashboard API
// ==========================================
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// ==========================================
// Admin API
// ==========================================
export const adminAPI = {
  getStudents: (params) => api.get('/admin/students', { params }),
  getOverview: () => api.get('/admin/overview'),
};

export default api;
