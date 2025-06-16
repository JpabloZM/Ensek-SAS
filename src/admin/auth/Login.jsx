import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAlertas } from "../hooks/useAlertas";
import { useAuth } from "../../hooks/useAuth";
import "./Auth.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "admin@test.com",
    password: "admin123",
  });

  const { mostrarAlerta } = useAlertas();
  const { login } = useAuth();
  const navigate = useNavigate();

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
      // Usar la función login del hook de autenticación
      const user = await login(formData.email, formData.password);

      // Verificar si el usuario es administrador
      if (user.role !== "admin") {
        mostrarAlerta("Error", "No tienes permisos de administrador", "error");
        return;
      }

      mostrarAlerta(
        "¡Bienvenido!",
        `Has iniciado sesión como ${user.name}`,
        "success"
      );

      // Redirect admin directly to /admin/calendario
      setTimeout(() => {
        navigate("/admin/calendario", { replace: true });
      }, 1500);
    } catch (error) {
      console.error("Error durante el inicio de sesión:", error);
      mostrarAlerta(
        "Error",
        "Ocurrió un error durante el inicio de sesión",
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
              style={{ color: "#333", backgroundColor: "white" }}
              autoComplete="email"
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
              style={{ color: "#333", backgroundColor: "white" }}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="auth-button">
            Iniciar Sesión
          </button>
        </form>

        <p className="auth-link">
          ¿No tienes una cuenta?{" "}
          <Link to="/admin/registro">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
