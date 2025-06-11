import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAlertas } from "../../hooks/useAlertas";
import "../../styles/Auth.css";

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
      mostrarAlerta({
        icon: "error",
        title: "Error",
        text: "Todos los campos son obligatorios",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      mostrarAlerta({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden",
      });
      return;
    }

    if (formData.password.length < 6) {
      mostrarAlerta({
        icon: "error",
        title: "Error",
        text: "La contraseña debe tener al menos 6 caracteres",
      });
      return;
    }

    try {
      // Obtener usuarios existentes
      const usuariosExistentes =
        JSON.parse(localStorage.getItem("usuarios")) || [];

      // Verificar si el email ya está registrado
      if (usuariosExistentes.some((user) => user.email === formData.email)) {
        mostrarAlerta({
          icon: "error",
          title: "Error",
          text: "El email ya está registrado",
        });
        return;
      }

      // Crear nuevo usuario (siempre como usuario normal)
      const nuevoUsuario = {
        id: Date.now().toString(),
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        role: "user", // Siempre se crea como usuario normal
        createdAt: new Date().toISOString(),
      };

      // Guardar en localStorage
      usuariosExistentes.push(nuevoUsuario);
      localStorage.setItem("usuarios", JSON.stringify(usuariosExistentes));

      mostrarAlerta({
        icon: "success",
        title: "Registro exitoso",
        text: "Tu cuenta ha sido creada correctamente",
      });

      // Redirigir al login
      navigate("/login");
    } catch (error) {
      mostrarAlerta({
        icon: "error",
        title: "Error",
        text: "Hubo un error al registrar el usuario",
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Crear Cuenta</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ingresa tu nombre completo"
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
              placeholder="Ingresa tu correo electrónico"
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
              placeholder="Ingresa tu contraseña"
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
              placeholder="Confirma tu contraseña"
            />
          </div>

          <button type="submit" className="btn-primary">
            Registrarse
          </button>
        </form>

        <p className="auth-link">
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
