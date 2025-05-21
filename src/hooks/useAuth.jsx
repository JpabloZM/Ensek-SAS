import { useState, useEffect } from "react";

const mockUsers = [
  {
    id: 1,
    email: "admin@test.com",
    password: "admin123",
    name: "Admin",
    role: "admin",
  },
  {
    id: 2,
    email: "test@example.com",
    password: "user123",
    name: "Usuario de Prueba",
    role: "user",
  },
];

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Restore user from localStorage on init
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      // Simulate API call with mock data
      const user = mockUsers.find((u) => u.email === email);

      if (!user || user.password !== password) {
        throw new Error("Credenciales inválidas");
      }

      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      return userWithoutPassword;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      if (mockUsers.some((u) => u.email === userData.email)) {
        throw new Error("El usuario ya existe");
      }

      const newUser = {
        id: mockUsers.length + 1,
        ...userData,
        role: "user",
      };
      mockUsers.push(newUser);
      return { message: "Usuario registrado exitosamente" };
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
      localStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      setError(error.message);
      console.error("Error during logout:", error);
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
