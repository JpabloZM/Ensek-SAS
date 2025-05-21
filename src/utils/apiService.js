// API service for connecting to the backend
import axios from 'axios';

// Determine the API base URL based on environment
const API_BASE_URL = import.meta.env.PROD 
  ? '/api'  // In production, use relative path (with proxy)
  : 'http://localhost:5000/api'; // In development, use direct URL

// Create an axios instance
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Add this for CORS support if needed
});

// Add a request interceptor to add the auth token to every request
API.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (err) {
        console.error('Error parsing user from localStorage:', err);
        // Clear invalid data
        localStorage.removeItem('user');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
API.interceptors.response.use(
  (response) => {
    console.log('API Response success:', response.config.url, response.data);
    return response.data;
  },
  (error) => {
    console.log('API Response error:', error.config?.url, error.response?.data || error.message);
    const message = error.response?.data?.message || 'Ocurrió un error en la solicitud';
    // You can use toast here if you add react-toastify to your project
    // toast.error(message);
    return Promise.reject(new Error(message));
  }
);

// API services
export const apiService = {  // Auth API calls
  auth: {
    login: async (email, password) => {
      console.log('Sending login request with:', { email, password });
      return API.post('/auth/login', { email, password });
    },
    
    register: async (userData) => {
      console.log('Sending register request with:', userData);
      return API.post('/auth/register', userData);
    },
    
    getProfile: async () => {
      return API.get('/auth/profile');
    },
  },
  
  // Service requests API calls
  services: {
    create: async (serviceData) => {
      return API.post('/services/request', serviceData);
    },
    
    getAll: async () => {
      return API.get('/services/requests');
    },
    
    getById: async (id) => {
      return API.get(`/services/requests/${id}`);
    },
    
    updateStatus: async (id, statusData) => {
      return API.put(`/services/requests/${id}/status`, statusData);
    },
  },
  
  // Inventory API calls
  inventory: {
    create: async (item) => {
      return API.post('/inventory', item);
    },
    
    getAll: async () => {
      return API.get('/inventory');
    },
    
    getById: async (id) => {
      return API.get(`/inventory/${id}`);
    },
    
    update: async (id, item) => {
      return API.put(`/inventory/${id}`, item);
    },
    
    delete: async (id) => {
      return API.delete(`/inventory/${id}`);
    },
  },

  // User management API calls
  users: {
    getAll: async () => {
      return API.get('/users');
    },
    
    getById: async (id) => {
      return API.get(`/users/${id}`);
    },
    
    update: async (id, userData) => {
      return API.put(`/users/${id}`, userData);
    },
    
    delete: async (id) => {
      return API.delete(`/users/${id}`);
    },
  },
};
