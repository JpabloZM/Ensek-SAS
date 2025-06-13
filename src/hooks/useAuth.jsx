import { useState, useEffect } from "react";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    // Restore user from localStorage on init
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Verify the user has necessary properties
        if (parsedUser && parsedUser.token) {
          console.log("Restored user from localStorage:", {
            name: parsedUser.name,
            email: parsedUser.email,
            role: parsedUser.role
          });
          setUser(parsedUser);
        } else {
          console.warn("Invalid user data in localStorage (missing token), clearing...");
          localStorage.removeItem("user");
        }
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
        localStorage.removeItem("user");
      }
    } else {
      console.log("No user found in localStorage");
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const data = await apiService.auth.login(email, password);
      
      if (data && data.user && data.user.token) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      } else {
        throw new Error("Login successful but received invalid user data");
      }
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
