import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAlertas } from "../admin/hooks/useAlertas";
import { useAuth } from "../hooks/useAuth";
import "../admin/auth/Auth.css";
import "./UnifiedLogin.css";

const UnifiedLogin = () => {
  const { login, user } = useAuth();
  const { mostrarAlerta } = useAlertas();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the original path and service type from location state
  const from = location.state?.from?.pathname || "/app";
  const serviceType = location.state?.from?.search?.serviceType || location.state?.serviceType || "";
  
  // Construct the redirect URL with service type if coming from form
  const redirectPath = from.includes('/formulario') && serviceType 
    ? `${from}?serviceType=${serviceType}` 
    : from;

  // If already logged in, redirect based on role
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate("/admin/dashboard", { replace: true });
      } else {
        // Check if we need to redirect to a specific path with service type
        navigate(redirectPath, { replace: true });
      }
    }
  }, [user, navigate, redirectPath]);
  
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
      console.log('Attempting login with:', { email: formData.email });
      // Add delay to make sure console.log appears before any potential errors
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const user = await login(formData.email, formData.password);
      console.log('Login successful, user data:', { 
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

      // After successful login, redirect based on user role
      setTimeout(() => {
        if (user.role === 'admin') {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate(redirectPath, { replace: true });
        }
      }, 1500);
    } catch (error) {
      console.error("Error durante el inicio de sesión:", error);
      
      // Enhanced error logging for debugging
      if (error.response) {
        console.error("Server responded with:", { 
          status: error.response.status,
          data: error.response.data 
        });
        
        // Show more specific error message from server if available
        const errorMsg = error.response.data?.message || "Error de autenticación";
        mostrarAlerta("Error", errorMsg, "error");
      } else if (error.request) {
        // Request was made but no response received
        console.error("No response received:", error.request);
        mostrarAlerta("Error", "No se recibió respuesta del servidor", "error");
      } else {
        // Something happened in setting up the request
        console.error("Request setup error:", error.message);
        mostrarAlerta("Error", error.message || "Ocurrió un error durante el inicio de sesión", "error");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Iniciar Sesión</h2>
        <p className="auth-subheader">Accede con tu cuenta de cliente o administrador</p>
        
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

        <div className="auth-helper">
          <p>Credenciales de prueba:</p>
          <div className="credentials-container">
            <div className="credential-box">
              <h4>Cliente</h4>
              <p>Email: user@test.com</p>
              <p>Contraseña: user123</p>
            </div>
            <div className="credential-box">
              <h4>Administrador</h4>
              <p>Email: admin@test.com</p>
              <p>Contraseña: admin123</p>
            </div>
          </div>
        </div>

        <p className="auth-link">
          ¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default UnifiedLogin;
