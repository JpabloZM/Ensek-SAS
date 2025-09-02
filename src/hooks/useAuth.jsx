import { useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "../utils/apiService";
import { sessionService } from "../services/sessionService";
import { errorHandler } from "../utils/errorHandler";
import { logger } from "../utils/logger";

const AUTH_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  ERROR: "error",
  SUCCESS: "success",
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [authState, setAuthState] = useState({
    status: AUTH_STATES.IDLE,
    error: null,
    message: null,
  });

  // Usar useRef para el token de cancelación de requests
  const cancelTokenRef = useRef(null);

  // Control de montaje del componente
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
      // Cancelar cualquier request pendiente al desmontar
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel();
      }
    };
  }, []);

  const updateAuthState = useCallback(
    (status, error = null, message = null) => {
      if (isMounted.current) {
        setAuthState({ status, error, message });
      }
    },
    []
  );

  const handleAuthError = useCallback(
    (error) => {
      const handledError = errorHandler.handleAuthError(error);
      logger.error("Error de autenticación", { error: handledError });
      updateAuthState(AUTH_STATES.ERROR, handledError.message);
      return handledError; // Retornamos el error en lugar de lanzarlo
    },
    [updateAuthState]
  );

  // Manejador de expiración de sesión
  const handleSessionExpired = useCallback(() => {
    logger.warn("Sesión expirada");
    setUser(null);
    updateAuthState(
      AUTH_STATES.ERROR,
      "La sesión ha expirado. Por favor, inicie sesión nuevamente."
    );
  }, [updateAuthState]);

  // Manejador de renovación de sesión con retry
  const handleSessionRefresh = useCallback(
    async (retryCount = 3) => {
      try {
        const currentUser = sessionService.getSession();
        if (!currentUser?.token) {
          logger.debug("No hay token para refrescar");
          return false;
        }

        logger.debug("Intentando refrescar token", {
          userId: currentUser._id,
          tokenLength: currentUser.token.length,
        });

        const refreshedData = await apiService.auth.refreshToken(
          currentUser.token,
          { cancelToken: cancelTokenRef.current?.token }
        );

        if (!refreshedData) {
          logger.error("No se recibieron datos de refresh");
          handleSessionExpired();
          return false;
        }

        if (!refreshedData.token) {
          logger.error("No se recibió token en la respuesta", {
            refreshedData,
          });
          handleSessionExpired();
          return false;
        }

        const updatedUser = {
          ...currentUser,
          token: refreshedData.token,
        };

        try {
          sessionService.setSession(updatedUser);
          setUser(updatedUser);
          updateAuthState(AUTH_STATES.SUCCESS);
          logger.info("Sesión renovada exitosamente");
          return true;
        } catch (storageError) {
          logger.error("Error al almacenar la sesión actualizada", {
            error: storageError,
            updatedUser: { ...updatedUser, token: "***" },
          });
          handleSessionExpired();
          return false;
        }
      } catch (error) {
        // Log detallado del error
        logger.error("Error al renovar sesión", {
          error: {
            name: error.name,
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            stack: error.stack,
          },
        });

        if (retryCount > 0 && error.response?.status === 429) {
          logger.warn("Límite de tasa excedido, reintentando...");
          const delay = Math.pow(2, 4 - retryCount) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          return handleSessionRefresh(retryCount - 1);
        }

        if (error.response?.status === 401 || error.response?.status === 403) {
          logger.warn("Token inválido o expirado");
          handleSessionExpired();
          return false;
        }

        handleSessionExpired();
        return false;
      }
    },
    [handleSessionExpired, updateAuthState]
  );

  // Efecto para restaurar y manejar la sesión
  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Crear nuevo token de cancelación
        cancelTokenRef.current = apiService.createCancelToken();

        // Restaurar sesión
        const session = sessionService.getSession();
        if (session) {
          setUser(session);
          updateAuthState(AUTH_STATES.SUCCESS);

          // Verificar token inmediatamente
          await handleSessionRefresh();
        } else {
          // Si no hay sesión, simplemente establecemos el estado como IDLE
          updateAuthState(AUTH_STATES.IDLE);
        }
      } catch (error) {
        // En lugar de lanzar el error, actualizamos el estado
        logger.error("Error al restaurar la sesión", error);
        setUser(null);
        updateAuthState(AUTH_STATES.ERROR, "Error al restaurar la sesión");
      }
    };

    setupAuth();

    // Configurar listeners para eventos de sesión
    window.addEventListener("sessionExpired", handleSessionExpired);
    window.addEventListener("sessionNeedsRefresh", handleSessionRefresh);

    return () => {
      window.removeEventListener("sessionExpired", handleSessionExpired);
      window.removeEventListener("sessionNeedsRefresh", handleSessionRefresh);
    };
  }, [
    handleSessionExpired,
    handleSessionRefresh,
    handleAuthError,
    updateAuthState,
  ]);
  const login = async (email, password) => {
    try {
      updateAuthState(AUTH_STATES.LOADING);
      logger.info("Iniciando proceso de login", { email });

      // Crear nuevo token de cancelación
      cancelTokenRef.current = apiService.createCancelToken();

      const data = await apiService.auth.login(email, password, {
        cancelToken: cancelTokenRef.current.token,
      });

      if (data?.user?.token) {
        sessionService.setSession(data.user);
        setUser(data.user);
        updateAuthState(AUTH_STATES.SUCCESS);

        logger.info("Login exitoso", { userId: data.user._id });
        return data.user;
      } else {
        throw new Error("Datos de usuario inválidos");
      }
    } catch (error) {
      return handleAuthError(error);
    }
  };

  const register = async (userData) => {
    try {
      updateAuthState(AUTH_STATES.LOADING);
      logger.info("Iniciando registro de usuario");

      // Crear nuevo token de cancelación
      cancelTokenRef.current = apiService.createCancelToken();

      const data = await apiService.auth.register(userData, {
        cancelToken: cancelTokenRef.current.token,
      });

      updateAuthState(AUTH_STATES.SUCCESS, null, "Registro exitoso");
      logger.info("Registro exitoso", { userId: data.user._id });

      return data;
    } catch (error) {
      return handleAuthError(error);
    }
  };

  const logout = async (options = { force: false }) => {
    try {
      updateAuthState(AUTH_STATES.LOADING);
      logger.info("Iniciando proceso de logout");

      if (!options.force) {
        // Crear nuevo token de cancelación
        cancelTokenRef.current = apiService.createCancelToken();

        // Intentar logout en el servidor
        try {
          await apiService.auth.logout({
            cancelToken: cancelTokenRef.current.token,
          });
        } catch (logoutError) {
          logger.warn("Error en logout del servidor", logoutError);
          // Continuamos con el logout local
        }
      }

      // Limpiar sesión local
      sessionService.clearSession();
      setUser(null);
      updateAuthState(AUTH_STATES.IDLE);

      logger.info("Logout completado");
    } catch (error) {
      return handleAuthError(error);
    }
  };

  return {
    user,
    authState,
    isAuthenticated: !!user,
    isLoading: authState.status === AUTH_STATES.LOADING,
    error: authState.error,
    login,
    register,
    logout,
  };
};
