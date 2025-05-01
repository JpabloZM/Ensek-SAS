import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAlertas } from "../hooks/useAlertas";
import "./Auth.css";




//LOGIN PARA DESARROLLO
const Login = () => {
  const [formData, setFormData] = useState({
    email: "admin@test.com",
    password: "admin123",
  });

  const { mostrarAlerta } = useAlertas();
  const navigate = useNavigate();

  // Crear usuario administrador de prueba al cargar el componente
  React.useEffect(() => {
    // Verificar si ya existen usuarios
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // Verificar si el usuario admin ya existe
    const adminExists = usuarios.some((u) => u.email === "admin@test.com");

    // Si no existe, lo creamos
    if (!adminExists) {
      const adminUser = {
        id: "admin-test",
        nombre: "Administrador",
        email: "admin@test.com",
        password: "admin123",
        role: "admin",
      };

      // Agregar el usuario administrador
      localStorage.setItem(
        "usuarios",
        JSON.stringify([...usuarios, adminUser])
      );
      console.log("Usuario administrador de prueba creado");
    }
  }, [navigate]);
//FINAL DE COGIDO LOGIN DESARROLLO




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
      // Obtener usuarios del localStorage
      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
      const usuario = usuarios.find(
        (u) => u.email === formData.email && u.password === formData.password
      );

      if (!usuario) {
        mostrarAlerta("Error", "Credenciales inválidas", "error");
        return;
      }

      // Guardar información de sesión
      localStorage.setItem(
        "usuarioActual",
        JSON.stringify({
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          role: usuario.role,
        })
      );

      await mostrarAlerta(
        "¡Bienvenido!",
        `Has iniciado sesión como ${usuario.nombre}`,
        "success"
      );

      // Asegurarnos de que la redirección ocurra después de que se complete el alert
      setTimeout(() => {
        navigate("/admin/calendario");
      }, 100);
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
