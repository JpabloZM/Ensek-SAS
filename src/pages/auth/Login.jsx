import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAlert } from "../../hooks/useAlert";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/Auth.css";

const ClientLogin = () => {
  const { login, user, loading } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (!loading && user) {
      console.log("Usuario autenticado, redirigiendo...", user);
      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/cliente", { replace: true });
      }
    }
  }, [user, loading, navigate]);

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
    console.log("Intentando iniciar sesión con:", formData.email);

    if (!formData.email || !formData.password) {
      showAlert("Por favor complete todos los campos", "error");
      return;
    }

    try {
      await login(formData.email, formData.password);
      // La redirección se manejará en el useEffect
    } catch (error) {
      console.error("Error en login:", error);
      showAlert(
        error.response?.data?.message || "Error al iniciar sesión",
        "error"
      );
    }
  };

  if (loading) {
    return <div className="auth-container">Cargando...</div>;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              required
            />
          </div>
          <button type="submit" className="auth-button">
            Iniciar Sesión
          </button>
        </form>
        <p className="auth-link">
          ¿No tienes una cuenta?{" "}
          <a
            href="/registro"
            onClick={(e) => {
              e.preventDefault();
              navigate("/registro");
            }}
          >
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
};

export default ClientLogin;
