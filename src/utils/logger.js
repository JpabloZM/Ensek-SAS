// Niveles de log
export const LogLevel = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
};

class LoggerService {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.logLevel = process.env.LOG_LEVEL || "info";
    this.config = {
      console: true,
      file: false,
      remote: false,
      maxLogSize: 1024 * 1024, // 1MB
      maxLogFiles: 5,
    };

    // Buffer para logs en memoria
    this.logBuffer = [];
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, context = {}) {
    const logEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      context: {
        ...context,
        environment: process.env.NODE_ENV,
        url: typeof window !== "undefined" ? window.location.href : undefined,
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      },
    };

    // Añadir al buffer si está habilitado el logging en archivo
    if (this.config.file) {
      this.logBuffer.push(logEntry);

      // Si el buffer excede el tamaño máximo, guardarlo en archivo
      if (this.logBuffer.length >= 100) {
        this.flushBufferToFile();
      }
    }

    return logEntry;
  }

  async flushBufferToFile() {
    if (this.logBuffer.length === 0) return;

    try {
      // Aquí implementaríamos la lógica para guardar en archivo
      // Por ahora solo limpiamos el buffer
      this.logBuffer = [];
    } catch (error) {
      console.error("Error al guardar logs en archivo:", error);
    }
  }

  error(message, error = null, context = {}) {
    const errorDetails = error
      ? {
          name: error.name,
          message: error.message,
          stack: this.isDevelopment ? error.stack : undefined,
          code: error.code,
        }
      : {};

    const logData = this.formatMessage(LogLevel.ERROR, message, {
      ...context,
      error: errorDetails,
    });

    console.error(JSON.stringify(logData, null, 2));

    // En producción, podríamos enviar errores críticos a un servicio externo
    if (process.env.NODE_ENV === "production") {
      // TODO: Implementar envío a servicio de monitoreo
    }
  }

  warn(message, context = {}) {
    const logData = this.formatMessage(LogLevel.WARN, message, context);
    console.warn(JSON.stringify(logData, null, 2));
  }

  info(message, context = {}) {
    const logData = this.formatMessage(LogLevel.INFO, message, context);
    console.info(JSON.stringify(logData, null, 2));
  }

  debug(message, context = {}) {
    if (this.isDevelopment) {
      const logData = this.formatMessage(LogLevel.DEBUG, message, context);
      console.debug(JSON.stringify(logData, null, 2));
    }
  }

  // Métodos especializados
  authLog(message, context = {}) {
    const logData = this.formatMessage("auth", message, {
      ...context,
      subsystem: "authentication",
    });
    this.info(logData.message, logData.context);
  }

  apiLog(method, endpoint, status, context = {}) {
    const logData = this.formatMessage(
      "api",
      `${method} ${endpoint} - ${status}`,
      {
        ...context,
        subsystem: "api",
      }
    );
    this.info(logData.message, logData.context);
  }

  performanceLog(action, duration, context = {}) {
    const logData = this.formatMessage(
      "performance",
      `${action} took ${duration}ms`,
      {
        ...context,
        subsystem: "performance",
      }
    );
    this.debug(logData.message, logData.context);
  }

  userActionLog(userId, action, context = {}) {
    const logData = this.formatMessage(
      "user-action",
      `User ${userId}: ${action}`,
      {
        ...context,
        subsystem: "user-activity",
      }
    );
    this.info(logData.message, logData.context);
  }

  componentLog(componentName, action, context = {}) {
    const logData = this.formatMessage(
      "component",
      `${componentName}: ${action}`,
      {
        ...context,
        subsystem: "ui",
      }
    );
    this.debug(logData.message, logData.context);
  }
}

export const logger = new LoggerService();
