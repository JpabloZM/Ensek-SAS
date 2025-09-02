// src/utils/apiService.js
// Centralized API service for authentication and other API calls
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Configure axios with better error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    return Promise.reject(error);
  }
);

// Configuración del interceptor para tokens
axios.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const auth = {
  register: async (userData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        userData
      );
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },
  login: async (email, password) => {
    try {
      console.log(`Making login request to ${API_BASE_URL}/auth/login`);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      console.log("Login response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  getProfile: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`);
      return response.data;
    } catch (error) {
      console.error("Profile fetch error:", error);
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`);
      return response.data;
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },
};

export const apiService = {
  auth,
  // Add other service groups here (e.g., inventory, services)
};
