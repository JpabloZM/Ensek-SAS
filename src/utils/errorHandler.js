import { logger } from "./logger";

// Tipos de error personalizados
export class ValidationError extends Error {
  constructor(message, errors = {}) {
    super(message);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

export class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthorizationError";
  }
}

// Servicio de manejo de errores
class ErrorHandlerService {
  constructor() {
    this.logger = logger;
  }

  // Manejar errores de API
  handleApiError(error) {
    if (error.response) {
      // El servidor respondió con un status code fuera del rango 2xx
      const { status, data } = error.response;

      switch (status) {
        case 400:
          this.logger.warn("Error de validación en la petición", {
            data,
            status,
          });
          throw new ValidationError(
            data.message || "Datos de entrada inválidos",
            data.errors
          );

        case 401:
          this.logger.warn("Error de autenticación", {
            data,
            status,
          });
          throw new AuthenticationError(data.message || "No autorizado");

        case 403:
          this.logger.warn("Error de autorización", {
            data,
            status,
          });
          throw new AuthorizationError(data.message || "Acceso denegado");

        case 404:
          this.logger.warn("Recurso no encontrado", {
            data,
            status,
          });
          throw new Error(data.message || "Recurso no encontrado");

        case 422:
          this.logger.warn("Error de validación", {
            data,
            status,
          });
          throw new ValidationError(
            data.message || "Error de validación",
            data.errors
          );

        default:
          this.logger.error("Error de servidor", {
            data,
            status,
          });
          throw new Error(
            data.message || "Ha ocurrido un error en el servidor"
          );
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      this.logger.error("No se recibió respuesta del servidor", {
        error: error.request,
      });
      throw new Error("No se pudo conectar con el servidor");
    } else {
      // Algo sucedió en la configuración de la petición
      this.logger.error("Error en la configuración de la petición", {
        error: error.message,
      });
      throw new Error("Error al procesar la solicitud");
    }
  }

  // Manejar errores de formulario
  handleFormError(error) {
    if (error instanceof ValidationError) {
      return {
        message: error.message,
        errors: error.errors,
      };
    }

    if (error instanceof AuthenticationError) {
      return {
        message: error.message,
        type: "auth",
      };
    }

    this.logger.error("Error no manejado en formulario", {
      error: error.message,
      stack: error.stack,
    });

    return {
      message: "Ha ocurrido un error inesperado",
      type: "error",
    };
  }

  // Manejar errores genéricos
  handleError(error, context = {}) {
    this.logger.error("Error general", {
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
      },
      context,
    });

    return {
      message: this.getUserFriendlyMessage(error),
      type: "error",
    };
  }

  // Manejar errores específicos de autenticación
  handleAuthError(error) {
    this.logger.error("Error de autenticación", {
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
      },
    });

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          return new AuthenticationError(
            data.message || "Credenciales inválidas"
          );
        case 403:
          return new AuthorizationError(data.message || "Acceso denegado");
        default:
          return new Error(data.message || "Error en la autenticación");
      }
    }

    if (
      error instanceof AuthenticationError ||
      error instanceof AuthorizationError
    ) {
      return error;
    }

    return new Error("Error en el proceso de autenticación");
  }

  // Obtener mensaje amigable para el usuario
  getUserFriendlyMessage(error) {
    if (error instanceof ValidationError) {
      return "Por favor verifica los datos ingresados";
    }
    if (error instanceof AuthenticationError) {
      return "Error de autenticación. Por favor inicia sesión nuevamente";
    }
    if (error instanceof AuthorizationError) {
      return "No tienes permisos para realizar esta acción";
    }
    return "Ha ocurrido un error. Por favor intenta nuevamente";
  }
}

export const errorHandler = new ErrorHandlerService();
