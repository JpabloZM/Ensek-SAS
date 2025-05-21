import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAlertas } from "../../hooks/useAlertas";
import { useAuth } from "../../hooks/useAuth";
import "../../admin/auth/Auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { mostrarAlerta } = useAlertas();
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (
      !formData.nombre ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      mostrarAlerta("Error", "Todos los campos son obligatorios", "error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      mostrarAlerta("Error", "Las contraseñas no coinciden", "error");
      return;
    }

    if (formData.password.length < 6) {
      mostrarAlerta(
        "Error",
        "La contraseña debe tener al menos 6 caracteres",
        "error"
      );
      return;
    }

    try {
      // Preparar los datos del usuario para enviar a la API
      const userData = {
        name: formData.nombre,
        email: formData.email,
        password: formData.password,
        role: "user", // Por defecto registramos usuarios normales
        phone: "",    // Campos opcionales que podríamos agregar al formulario
        address: ""   // en el futuro
      };

      // Llamar a la API para registrar al usuario
      await register(userData);

      await mostrarAlerta(
        "¡Éxito!",
        "Registro completado correctamente",
        "success"
      );
      navigate("/login");
    } catch (error) {
      console.error("Error durante el registro:", error);
      mostrarAlerta(
        "Error",
        error.message || "Ocurrió un error durante el registro",
        "error"
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Registro de Cliente</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ingrese su nombre completo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ingrese su correo electrónico"
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirme su contraseña"
            />
          </div>

          <button type="submit" className="auth-button">
            Registrarse
          </button>
        </form>

        <p className="auth-link">
          ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
