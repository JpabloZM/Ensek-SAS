import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAlertas } from "../admin/hooks/useAlertas";
import { useAuth } from "../hooks/useAuth";
import { validator, ValidationSchemas } from "../utils/validator";
import { logger } from "../utils/logger";
import EnsekLogo from "./EnsekLogo";
import "../admin/auth/Auth.css";
import "./UnifiedLogin.css";
import "./UnifiedRegister.css";

// Componente para las partículas de fondo
const ParticlesBackground = () => {
  return (
    <div className="particles-background">
      {[...Array(30)].map((_, index) => (
        <div key={index} className="particle" />
      ))}
    </div>
  );
};

const UnifiedRegister = () => {
  const initialFormState = {
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",  // Nuevo campo opcional
    direccion: "", // Nuevo campo opcional
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mostrarAlerta } = useAlertas();
  const { register, authState } = useAuth();
  const navigate = useNavigate();

  // Limpieza de errores cuando cambia el formulario
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validar campo individual
    const fieldError = validateField(name, formData[name]);
    setFormErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const validateField = (name, value) => {
    // Validación especial para confirmPassword
    if (name === "confirmPassword") {
      if (!value) return "Debe confirmar su contraseña";
      if (value !== formData.password) return "Las contraseñas no coinciden";
      return "";
    }

    const fieldSchema = ValidationSchemas.register[name];
    if (!fieldSchema) return "";

    const validationResult = validator.validateForm(
      { [name]: value },
      { [name]: fieldSchema }
    );

    return validationResult.errors[name] || "";
  };

  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

    try {
      setIsSubmitting(true);
      
      // Marcar todos los campos como tocados
      const allTouched = Object.keys(formData).reduce((acc, field) => ({
        ...acc,
        [field]: true
      }), {});
      setTouched(allTouched);

      // Validar todo el formulario
      if (!validateForm()) {
        mostrarAlerta("Error", "Por favor, corrija los errores del formulario", "error");
        return;
      }

      logger.info("Iniciando registro de usuario", { email: formData.email });

      // Preparar los datos del usuario
      const userData = {
        name: formData.nombre,
        email: formData.email,
        password: formData.password,
        role: "user",
        phone: formData.telefono || "",
        address: formData.direccion || "",
      };

      // Registrar usuario
      const result = await register(userData);
      
      logger.info("Registro exitoso", { userId: result.user._id });

      await mostrarAlerta(
        "¡Éxito!",
        "Registro completado correctamente. Ahora puedes iniciar sesión.",
        "success"
      );
      
      // Limpiar formulario y navegar al login
      setFormData(initialFormState);
      setTouched({});
      navigate("/login");
    } catch (error) {
      logger.error("Error en registro", {
        error,
        email: formData.email
      });

      mostrarAlerta(
        "Error",
        error.message || "Ocurrió un error durante el registro",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldClassName = (fieldName) => {
    const baseClass = "form-control";
    if (!touched[fieldName]) return baseClass;
    return formErrors[fieldName] ? `${baseClass} error` : `${baseClass} valid`;
  };

  return (
    <div className="auth-container">
      <ParticlesBackground />

      <div className="auth-card register-auth-card">
        <div className="auth-logo">
          <EnsekLogo size="xlarge" className="login-logo" />
        </div>
        <h2>Registro de Cliente</h2>
        <form
          onSubmit={handleSubmit}
          className="auth-form register-form"
          noValidate
        >
          {/* Fila para correo electrónico y nombre */}
          <div className="register-form-row">
            <div className="register-form-column">
              <div className="form-group">
                <label htmlFor="email">Correo electrónico *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName("email")}
                  placeholder="Ingrese su correo electrónico"
                  disabled={isSubmitting}
                  required
                />
                {touched.email && formErrors.email && (
                  <span className="error-message">{formErrors.email}</span>
                )}
              </div>
            </div>

            <div className="register-form-column">
              <div className="form-group">
                <label htmlFor="nombre">Nombre completo *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName("nombre")}
                  placeholder="Ingrese su nombre completo"
                  disabled={isSubmitting}
                  required
                />
                {touched.nombre && formErrors.nombre && (
                  <span className="error-message">{formErrors.nombre}</span>
                )}
              </div>
            </div>
          </div>

          {/* Fila para contraseña y confirmar contraseña */}
          <div className="register-form-row">
            <div className="register-form-column">
              <div className="form-group">
                <label htmlFor="password">Contraseña *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName("password")}
                  placeholder="Ingrese su contraseña"
                  disabled={isSubmitting}
                  required
                />
                {touched.password && formErrors.password && (
                  <span className="error-message">{formErrors.password}</span>
                )}
              </div>
            </div>

            <div className="register-form-column">
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar contraseña *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName("confirmPassword")}
                  placeholder="Confirme su contraseña"
                  disabled={isSubmitting}
                  required
                />
                {touched.confirmPassword && formErrors.confirmPassword && (
                  <span className="error-message">{formErrors.confirmPassword}</span>
                )}
              </div>
            </div>
          </div>

          {/* Fila para campos opcionales */}
          <div className="register-form-row">
            <div className="register-form-column">
              <div className="form-group">
                <label htmlFor="telefono">Teléfono (opcional)</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName("telefono")}
                  placeholder="Ingrese su teléfono"
                  disabled={isSubmitting}
                />
                {touched.telefono && formErrors.telefono && (
                  <span className="error-message">{formErrors.telefono}</span>
                )}
              </div>
            </div>

            <div className="register-form-column">
              <div className="form-group">
                <label htmlFor="direccion">Dirección (opcional)</label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName("direccion")}
                  placeholder="Ingrese su dirección"
                  disabled={isSubmitting}
                />
                {touched.direccion && formErrors.direccion && (
                  <span className="error-message">{formErrors.direccion}</span>
                )}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={isSubmitting || authState.status === 'loading'}
          >
            {isSubmitting ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <p className="auth-link">
          ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>

        <div className="auth-link">
          <Link to="/welcome">Volver a Inicio</Link>
        </div>
      </div>
    </div>
  );
};

export default UnifiedRegister;
