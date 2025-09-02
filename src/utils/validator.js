// Reglas de validación comunes
const ValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Formato de correo electrónico inválido'
  },
  password: {
    minLength: 6,
    maxLength: 50,
    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
    message: 'La contraseña debe tener al menos 6 caracteres, incluyendo letras y números'
  },
  phone: {
    pattern: /^\+?[\d\s-]{8,}$/,
    message: 'Número de teléfono inválido'
  }
};

class ValidationService {
  validateEmail(email) {
    if (!email) {
      return { isValid: false, message: 'El correo electrónico es requerido' };
    }
    if (!ValidationRules.email.pattern.test(email)) {
      return { isValid: false, message: ValidationRules.email.message };
    }
    return { isValid: true };
  }

  validatePassword(password) {
    if (!password) {
      return { isValid: false, message: 'La contraseña es requerida' };
    }
    if (password.length < ValidationRules.password.minLength) {
      return { 
        isValid: false, 
        message: `La contraseña debe tener al menos ${ValidationRules.password.minLength} caracteres`
      };
    }
    if (!ValidationRules.password.pattern.test(password)) {
      return { isValid: false, message: ValidationRules.password.message };
    }
    return { isValid: true };
  }

  validatePhone(phone) {
    if (!phone) return { isValid: true }; // El teléfono es opcional
    if (!ValidationRules.phone.pattern.test(phone)) {
      return { isValid: false, message: ValidationRules.phone.message };
    }
    return { isValid: true };
  }

  validateRequired(value, fieldName) {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return { 
        isValid: false, 
        message: `El campo ${fieldName} es requerido`
      };
    }
    return { isValid: true };
  }

  validateLength(value, fieldName, min, max) {
    if (value.length < min) {
      return { 
        isValid: false, 
        message: `${fieldName} debe tener al menos ${min} caracteres`
      };
    }
    if (max && value.length > max) {
      return { 
        isValid: false, 
        message: `${fieldName} no puede tener más de ${max} caracteres`
      };
    }
    return { isValid: true };
  }

  // Validación de formulario completo
  validateForm(data, schema) {
    const errors = {};
    let isValid = true;

    Object.keys(schema).forEach(field => {
      const rules = schema[field];
      const value = data[field];

      if (rules.required) {
        const requiredCheck = this.validateRequired(value, rules.label || field);
        if (!requiredCheck.isValid) {
          errors[field] = requiredCheck.message;
          isValid = false;
          return;
        }
      }

      if (value) {
        switch (rules.type) {
          case 'email':
            const emailCheck = this.validateEmail(value);
            if (!emailCheck.isValid) {
              errors[field] = emailCheck.message;
              isValid = false;
            }
            break;

          case 'password':
            const passwordCheck = this.validatePassword(value);
            if (!passwordCheck.isValid) {
              errors[field] = passwordCheck.message;
              isValid = false;
            }
            break;

          case 'phone':
            const phoneCheck = this.validatePhone(value);
            if (!phoneCheck.isValid) {
              errors[field] = phoneCheck.message;
              isValid = false;
            }
            break;

          case 'string':
            if (rules.minLength || rules.maxLength) {
              const lengthCheck = this.validateLength(
                value, 
                rules.label || field, 
                rules.minLength || 0, 
                rules.maxLength
              );
              if (!lengthCheck.isValid) {
                errors[field] = lengthCheck.message;
                isValid = false;
              }
            }
            break;
        }

        // Validación personalizada si existe
        if (rules.validate) {
          const customCheck = rules.validate(value, data);
          if (!customCheck.isValid) {
            errors[field] = customCheck.message;
            isValid = false;
          }
        }
      }
    });

    return { isValid, errors };
  }
}

export const validator = new ValidationService();

// Esquemas de validación predefinidos
export const ValidationSchemas = {
  login: {
    email: {
      type: 'email',
      required: true,
      label: 'Correo electrónico'
    },
    password: {
      type: 'password',
      required: true,
      label: 'Contraseña'
    }
  },
  register: {
    name: {
      type: 'string',
      required: true,
      minLength: 3,
      label: 'Nombre completo'
    },
    email: {
      type: 'email',
      required: true,
      label: 'Correo electrónico'
    },
    password: {
      type: 'password',
      required: true,
      label: 'Contraseña'
    },
    confirmPassword: {
      type: 'string',
      required: true,
      label: 'Confirmar contraseña',
      validate: (value, data) => ({
        isValid: value === data.password,
        message: 'Las contraseñas no coinciden'
      })
    },
    phone: {
      type: 'phone',
      required: false,
      label: 'Teléfono'
    }
  }
};
