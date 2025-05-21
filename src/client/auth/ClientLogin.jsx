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
  const from = location.state?.from?.pathname || "/cliente";

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/cliente", { replace: true });
      }
    }
  }, [user, navigate]);
  
  const [formData, setFormData] = useState({
    email: "user@test.com",  // Pre-fill with test user
    password: "user123",     // Pre-fill with test password
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      mostrarAlerta("Error", "Por favor complete todos los campos", "error");
      return;
    }

    try {
      console.log('Attempting login with:', { email: formData.email });
      const user = await login(formData.email, formData.password);      console.log('Login successful, user data:', { 
        name: user.name,
        email: user.email,
        role: user.role,
        hasToken: !!user.token
      });
      
      mostrarAlerta(
        "¡Bienvenido!",
        `Has iniciado sesión como ${user.name || user.email}`,
        "success"
      );

      // Root redirect will now handle the routing based on role
      // No need for complex logic here - just go to root
      setTimeout(() => {
        console.log('Redirecting to root for role-based routing');
        navigate("/", { replace: true });
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
