// src/utils/apiService.js
// Centralized API service for authentication and other API calls
import axios from "axios";
import { sessionService } from "../services/sessionService.js";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

import { errorHandler } from "./errorHandler";
import { logger } from "./logger";
import { validator, ValidationSchemas } from "./validator";

// Configuración base de axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de solicitudes
axiosInstance.interceptors.request.use(
  (config) => {
    // No transformar datos en endpoints específicos
    if (config.url?.includes("/auth/refresh-token")) {
      config.transformResponse = [(data) => data];
      config.headers["Accept"] = "text/plain";
    }

    logger.debug("API Request", {
      url: config.url,
      method: config.method,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    logger.error("API Request Error", error);
    return Promise.reject(error);
  }
);

// Interceptor de respuestas
axiosInstance.interceptors.response.use(
  (response) => {
    logger.debug("API Response", {
      url: response.config.url,
      status: response.status,
      contentType: response.headers["content-type"],
    });
    return response;
  },
  async (error) => {
    // Log detallado del error
    logger.error("API Error Response", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    // Si es un error de autenticación (401) y no estamos ya en el proceso de refresh
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/refresh-token")
    ) {
      // Disparar evento de sesión expirada
      window.dispatchEvent(new CustomEvent("sessionExpired"));
    }

    // Si hay un error específico del refresh token, mejorar el mensaje
    if (error.config?.url?.includes("/auth/refresh-token")) {
      error.message =
        "Error al renovar la sesión: " +
        (error.response?.data?.message || error.message);
    }

    return Promise.reject(errorHandler.handleApiError(error));
  }
);

// Agregar token de autorización a las solicitudes
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const sessionData = sessionService.getSession();
      if (sessionData?.token) {
        config.headers.Authorization = `Bearer ${sessionData.token}`;
      }
    } catch (error) {
      logger.error("Error al procesar token de autorización:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const auth = {
  register: async (userData, config = {}) => {
    try {
      const response = await axiosInstance.post(
        "/auth/register",
        userData,
        config
      );
      return response.data;
    } catch (error) {
      logger.error("Registration error:", error);
      throw error;
    }
  },

  login: async (email, password, config = {}) => {
    try {
      logger.info(`Iniciando solicitud de login para ${email}`);
      const response = await axiosInstance.post(
        "/auth/login",
        { email, password },
        config
      );
      logger.info("Login exitoso");
      return response.data;
    } catch (error) {
      logger.error("Login error:", error);
      throw error;
    }
  },

  getProfile: async (config = {}) => {
    try {
      const response = await axiosInstance.get("/auth/profile", config);
      return response.data;
    } catch (error) {
      logger.error("Error al obtener perfil:", error);
      throw error;
    }
  },

  refreshToken: async (token, config = {}) => {
    try {
      logger.debug("Iniciando refresh de token", {
        tokenLength: token?.length,
        configHeaders: config?.headers,
      });

      if (!token) {
        throw new Error("Token no proporcionado para refresh");
      }

      const response = await axiosInstance.post(
        "/auth/refresh-token",
        { token },
        {
          ...config,
          headers: {
            ...config.headers,
            "Content-Type": "application/json",
            Accept: "text/plain",
          },
          transformResponse: [
            (data) => {
              // Si es un token JWT (comienza con 'ey'), retornarlo directamente
              if (typeof data === "string" && data.startsWith("ey")) {
                return { token: data };
              }
              // Si no, intentar parsearlo como JSON
              try {
                return JSON.parse(data);
              } catch (e) {
                logger.error("Error parsing refresh token response:", {
                  data,
                  error: e,
                });
                throw new Error("Formato de respuesta inválido");
              }
            },
          ],
        }
      );

      if (!response.data || !response.data.token) {
        throw new Error("Respuesta inválida del servidor");
      }

      logger.debug("Token refrescado exitosamente", {
        status: response.status,
        hasToken: !!response.data.token,
      });

      return { token: response.data.token };
    } catch (error) {
      logger.error("Error al refrescar token:", {
        error: {
          name: error.name,
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          stack: error.stack,
        },
      });
      // Mejorar el mensaje de error para el usuario
      const errorMessage =
        error.response?.status === 401
          ? "Sesión expirada. Por favor, inicie sesión nuevamente."
          : "Error al renovar la sesión. Por favor, inténtelo de nuevo.";
      throw new Error(errorMessage);
    }
  },

  logout: async (config = {}) => {
    try {
      await axiosInstance.post("/auth/logout", {}, config);
    } catch (error) {
      logger.error("Error al cerrar sesión:", error);
      throw error;
    }
  },
};

// Utilidad para crear tokens de cancelación
const createCancelToken = () => {
  return axios.CancelToken.source();
};

export const apiService = {
  auth,
  axiosInstance,
  createCancelToken: () => axios.CancelToken.source(),
  // Add other service groups here (e.g., inventory, services)
};
