import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAlertas } from "../hooks/useAlertas";
import "./Auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { mostrarAlerta } = useAlertas();
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

    // Obtener usuarios existentes
    const usuariosExistentes =
      JSON.parse(localStorage.getItem("usuarios")) || [];

    // Verificar si el email ya está registrado
    if (usuariosExistentes.some((user) => user.email === formData.email)) {
      mostrarAlerta("Error", "El email ya está registrado", "error");
      return;
    }

    // Crear nuevo usuario
    const nuevoUsuario = {
      id: Date.now().toString(),
      nombre: formData.nombre,
      email: formData.email,
      password: formData.password, // En una aplicación real, deberías hashear la contraseña
      role: "admin",
    };

    // Guardar en localStorage
    usuariosExistentes.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuariosExistentes));

    await mostrarAlerta(
      "¡Éxito!",
      "Registro completado correctamente",
      "success"
    );
    navigate("/admin/login");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Registro de Administrador</h2>
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
          ¿Ya tienes una cuenta? <Link to="/admin/login">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
