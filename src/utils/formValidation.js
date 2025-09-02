import { validator } from "./validator";

// Esquemas de validación predefinidos
const ValidationSchemas = {
  login: {
    email: {
      type: "email",
      required: true,
      label: "Correo electrónico",
    },
    password: {
      type: "password",
      required: true,
      label: "Contraseña",
    },
  },
  register: {
    nombre: {
      type: "string",
      required: true,
      minLength: 3,
      label: "Nombre completo",
    },
    email: {
      type: "email",
      required: true,
      label: "Correo electrónico",
    },
    password: {
      type: "password",
      required: true,
      label: "Contraseña",
    },
    confirmPassword: {
      type: "string",
      required: true,
      label: "Confirmar contraseña",
      validate: (value, data) => ({
        isValid: value === data.password,
        message: "Las contraseñas no coinciden",
      }),
    },
    telefono: {
      type: "phone",
      required: false,
      label: "Teléfono",
    },
    direccion: {
      type: "string",
      required: false,
      minLength: 5,
      label: "Dirección",
    },
  },
  serviceRequest: {
    tipo: {
      type: "string",
      required: true,
      label: "Tipo de servicio",
    },
    descripcion: {
      type: "string",
      required: true,
      minLength: 10,
      maxLength: 500,
      label: "Descripción",
    },
    fecha: {
      type: "date",
      required: true,
      label: "Fecha",
    },
    hora: {
      type: "time",
      required: true,
      label: "Hora",
    },
  },
};

// Hook personalizado para manejo de formularios
export const useFormValidation = (schema, initialData = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);

  const validateField = (name, value) => {
    const fieldSchema = schema[name];
    if (!fieldSchema) return "";

    const validationResult = validator.validateForm(
      { [name]: value },
      { [name]: fieldSchema }
    );

    return validationResult.errors[name] || "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validar el campo si ya ha sido tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setFormErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, formData[name]);
    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = () => {
    const validationResult = validator.validateForm(formData, schema);
    setFormErrors(validationResult.errors);
    setIsValid(validationResult.isValid);
    return validationResult.isValid;
  };

  const resetForm = () => {
    setFormData(initialData);
    setFormErrors({});
    setTouched({});
    setIsValid(false);
  };

  return {
    formData,
    formErrors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setFormData,
  };
};

// Funciones de utilidad para la validación
export const validateFields = {
  required: (value, label) => {
    if (!value || (typeof value === "string" && !value.trim())) {
      return `El campo ${label} es requerido`;
    }
    return "";
  },

  email: (value) => {
    if (!value) return "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value)
      ? ""
      : "Formato de correo electrónico inválido";
  },

  phone: (value) => {
    if (!value) return "";
    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    return phoneRegex.test(value) ? "" : "Formato de teléfono inválido";
  },

  minLength: (value, min, label) => {
    if (!value || value.length >= min) return "";
    return `${label} debe tener al menos ${min} caracteres`;
  },

  maxLength: (value, max, label) => {
    if (!value || value.length <= max) return "";
    return `${label} no puede tener más de ${max} caracteres`;
  },

  password: (value) => {
    if (!value) return "";
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    return passwordRegex.test(value)
      ? ""
      : "La contraseña debe tener al menos 6 caracteres, incluyendo letras y números";
  },

  date: (value) => {
    if (!value) return "";
    const date = new Date(value);
    return isNaN(date.getTime()) ? "Fecha inválida" : "";
  },

  time: (value) => {
    if (!value) return "";
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(value) ? "" : "Hora inválida";
  },
};

export { ValidationSchemas };
