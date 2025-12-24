import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with credentials
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add CSRF token handling
api.interceptors.request.use((config) => {
  // Get CSRF cookie
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];

  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login/', { username, password }),

  register: (firstname, lastname, username, password, email) =>
    api.post('/auth/register/', {
      firstname,
      lastname,
      username,
      password,
      email,
    }),

  logout: () => api.post('/auth/logout/'),

  me: () => api.get('/auth/me/'),
};

// Inspection API
export const inspectionAPI = {
  list: (page = 1, page_size = 5) =>
    api.get('/inspections/', { params: { page, page_size } }),

  detail: (id) => api.get(`/inspections/${id}/`),

  create: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return api.post('/inspections/create/', formData, config);
  },

  delete: (id) => api.post(`/inspections/${id}/delete/`),
};

export default api;
