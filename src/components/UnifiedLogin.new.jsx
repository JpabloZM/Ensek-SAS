import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAlertas } from "../admin/hooks/useAlertas";
import { useAuth } from "../hooks/useAuth";
import { validator, ValidationSchemas } from "../utils/validator";
import { errorHandler } from "../utils/errorHandler";
import { logger } from "../utils/logger";
import EnsekLogo from "./EnsekLogo";
import "../admin/auth/Auth.css";
import "./UnifiedLogin.css";

const ParticlesBackground = () => {
  return (
    <div className="particles-background">
      {[...Array(30)].map((_, index) => (
        <div key={index} className="particle" />
      ))}
    </div>
  );
};

const UnifiedLogin = () => {
  const { login, user } = useAuth();
  const { mostrarAlerta } = useAlertas();
  const navigate = useNavigate();
  const location = useLocation();
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the original path and service type from location state
  const from = location.state?.from?.pathname || "/app";
  const serviceType = location.state?.from?.search?.serviceType || 
                     location.state?.serviceType || "";

  // Construct the redirect URL with service type if coming from form
  const redirectPath = from.includes("/formulario") && serviceType
    ? `${from}?serviceType=${serviceType}`
    : from;

  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;

      if (user) {
        logger.info("Usuario ya autenticado, redirigiendo", {
          userId: user._id,
          role: user.role,
          redirectPath: user.role === "admin" ? "/admin/calendario" : redirectPath
        });

        if (user.role === "admin") {
          window.location.href = "/admin/calendario";
        } else {
          window.location.href = redirectPath;
        }
      }
    }
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateField = (name, value) => {
    const fieldSchema = ValidationSchemas.login[name];
    if (!fieldSchema) return "";

    const validationResult = validator.validateForm(
      { [name]: value },
      { [name]: fieldSchema }
    );

    return !validationResult.isValid ? validationResult.errors[name] : "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validar formulario completo
      const validationResult = validator.validateForm(formData, ValidationSchemas.login);
      
      if (!validationResult.isValid) {
        setFormErrors(validationResult.errors);
        mostrarAlerta("Error", "Por favor verifica los datos ingresados", "error");
        return;
      }

      logger.info("Iniciando intento de login", { email: formData.email });
      
      const user = await login(formData.email, formData.password);
      
      logger.info("Login exitoso", {
        userId: user._id,
        role: user.role,
        redirectPath: user.role === "admin" ? "/admin/calendario" : redirectPath
      });

      mostrarAlerta(
        "¡Bienvenido!",
        `Has iniciado sesión como ${user.name || user.email}`,
        "success"
      );

      setTimeout(() => {
        if (user.role === "admin") {
          window.location.href = "/admin/calendario";
        } else {
          window.location.href = redirectPath;
        }
      }, 1500);
    } catch (error) {
      const handledError = errorHandler.handleFormError(error);
      logger.error("Error en login", {
        error: handledError,
        email: formData.email
      });

      mostrarAlerta(
        "Error",
        handledError.message,
        handledError.type || "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <ParticlesBackground />

      <div className="auth-card">
        <div className="auth-logo">
          <EnsekLogo size="xlarge" className="login-logo" />
        </div>
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ingrese su correo electrónico"
              className={formErrors.email ? "error" : ""}
              disabled={isSubmitting}
            />
            {formErrors.email && (
              <span className="error-message">{formErrors.email}</span>
            )}
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
              className={formErrors.password ? "error" : ""}
              disabled={isSubmitting}
            />
            {formErrors.password && (
              <span className="error-message">{formErrors.password}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="auth-link">
          ¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>

        <div className="auth-link">
          <Link to="/welcome">Volver a Inicio</Link>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;
