import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAlertas } from "../../admin/hooks/useAlertas";
import { useAuth } from "../../hooks/useAuth";
import "../../admin/auth/Auth.css";

const ClientLogin = () => {
  const { login } = useAuth();
  const { mostrarAlerta } = useAlertas();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      const user = await login(formData.email, formData.password);

      mostrarAlerta(
        "¡Bienvenido!",
        `Has iniciado sesión como ${formData.email}`,
        "success"
      );

      // Los usuarios normales son redirigidos al home
      setTimeout(() => {
        navigate("/");
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
