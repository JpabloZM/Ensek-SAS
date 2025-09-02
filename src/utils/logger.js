// Niveles de log
export const LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

class LoggerService {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, context = {}) {
    return {
      timestamp: this.getTimestamp(),
      level,
      message,
      context,
      environment: process.env.NODE_ENV
    };
  }

  error(message, error = null, context = {}) {
    const errorDetails = error ? {
      name: error.name,
      message: error.message,
      stack: this.isDevelopment ? error.stack : undefined,
      code: error.code
    } : {};

    const logData = this.formatMessage(LogLevel.ERROR, message, {
      ...context,
      error: errorDetails
    });

    console.error(JSON.stringify(logData, null, 2));

    // En producción, podríamos enviar errores críticos a un servicio externo
    if (process.env.NODE_ENV === 'production') {
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

  // Método específico para logs de autenticación
  authLog(message, context = {}) {
    const logData = this.formatMessage('auth', message, {
      ...context,
      timestamp: this.getTimestamp()
    });
    console.log(JSON.stringify(logData, null, 2));
  }
}

export const logger = new LoggerService();
