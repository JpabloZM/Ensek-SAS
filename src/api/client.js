import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8000/api", // Ajusta esto según tu URL de Laravel
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor para manejar tokens
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Manejar error de autenticación
      localStorage.removeItem("token");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default client;
