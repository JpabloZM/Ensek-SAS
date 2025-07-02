import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAlertas } from "../../admin/hooks/useAlertas";
import { useAuth } from "../../hooks/useAuth";
import "../../admin/auth/Auth.css";

const ClientLogin = () => {
  const { login, user } = useAuth();
  const { mostrarAlerta } = useAlertas();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the original path and service type from location state
  const from = location.state?.from?.pathname || "/app";
  const serviceType = location.state?.serviceType || "";

  // Construct the redirect URL with service type if coming from form
  const redirectPath =
    from.includes("/formulario") && serviceType
      ? `${from}?serviceType=${serviceType}`
      : from;

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin/calendario", { replace: true });
      } else {
        // Check if we need to redirect to a specific path with service type
        navigate(redirectPath, { replace: true });
      }
    }
  }, [user, navigate, redirectPath]);

  const [formData, setFormData] = useState({
    email: "user@test.com", // Pre-fill with test user
    password: "user123", // Pre-fill with test password
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      mostrarAlerta("Error", "Por favor complete todos los campos", "error");
      return;
    }

    try {
      console.log("Attempting login with:", { email: formData.email });
      const user = await login(formData.email, formData.password);
      console.log("Login successful, user data:", {
        name: user.name,
        email: user.email,
        role: user.role,
        hasToken: !!user.token,
      });

      mostrarAlerta(
        "¡Bienvenido!",
        `Has iniciado sesión como ${user.name || user.email}`,
        "success"
      );

      // After successful login, redirect to the original destination
      setTimeout(() => {
        console.log("Redirecting to:", redirectPath);
        if (user.role === "admin") {
          navigate("/admin/calendario", { replace: true });
        } else {
          navigate(redirectPath, { replace: true });
        }
      }, 1500);
    } catch (error) {
      console.error("Error durante el inicio de sesión:", error);
      mostrarAlerta(
        "Error",
        error.message || "Ocurrió un error durante el inicio de sesión",
        "error"
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ingrese su correo electrónico"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingrese su contraseña"
              required
            />
          </div>

          <button type="submit" className="auth-button">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClientLogin;
