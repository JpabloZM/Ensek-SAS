import { useState, useEffect, useCallback } from "react";
import { apiService } from "../utils/apiService";
import { sessionService } from "../services/sessionService";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Manejador de expiración de sesión
  const handleSessionExpired = useCallback(() => {
    setUser(null);
    setError("La sesión ha expirado. Por favor, inicie sesión nuevamente.");
  }, []);

  // Manejador de renovación de sesión
  const handleSessionRefresh = useCallback(async () => {
    try {
      const currentUser = sessionService.getSession();
      if (currentUser && currentUser.token) {
        const refreshedData = await apiService.auth.refreshToken(
          currentUser.token
        );
        if (refreshedData && refreshedData.token) {
          sessionService.setSession({
            ...currentUser,
            token: refreshedData.token,
          });
          setUser((prev) => ({ ...prev, token: refreshedData.token }));
        }
      }
    } catch (error) {
      console.error("Error al renovar la sesión:", error);
      handleSessionExpired();
    }
  }, []);

  useEffect(() => {
    // Restaurar sesión al iniciar
    const session = sessionService.getSession();
    if (session) {
      setUser(session);
    }
    setLoading(false);

    // Configurar listeners para eventos de sesión
    window.addEventListener("sessionExpired", handleSessionExpired);
    window.addEventListener("sessionNeedsRefresh", handleSessionRefresh);

    return () => {
      window.removeEventListener("sessionExpired", handleSessionExpired);
      window.removeEventListener("sessionNeedsRefresh", handleSessionRefresh);
    };
  }, [handleSessionExpired, handleSessionRefresh]);
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Iniciando proceso de login...");
      const data = await apiService.auth.login(email, password);

      if (data?.user?.token) {
        // Usar sessionService para almacenar los datos de sesión
        sessionService.setSession(data.user);
        setUser(data.user);
        return data.user;
      } else {
        throw new Error("Datos de usuario inválidos");
      }
    } catch (error) {
      console.error("Error en login:", error);

      const errorMessage =
        error.response?.data?.message || "Error de autenticación";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const data = await apiService.auth.register(userData);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // Limpiar sesión usando sessionService
      sessionService.clearSession();
      setUser(null);

      // Llamar al endpoint de logout si existe
      try {
        await apiService.auth.logout();
      } catch (logoutError) {
        console.warn("Error en logout del servidor:", logoutError);
        // Continuamos con el logout local aunque falle el servidor
      }
    } catch (error) {
      setError(error.message);
      console.error("Error durante logout:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    login,
    register,
    logout,
    loading,
    error,
  };
};
