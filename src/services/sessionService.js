// Constantes para el manejo de sesión
const SESSION_KEY = "user";
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutos en milisegundos

class SessionService {
  constructor() {
    this.sessionCheckInterval = null;
    this.initializeSessionCheck();
  }

  // Inicializar verificación periódica de sesión
  initializeSessionCheck() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    this.sessionCheckInterval = setInterval(() => {
      this.checkSessionValidity();
    }, 60000); // Verificar cada minuto
  }

  // Guardar datos de sesión
  setSession(userData) {
    try {
      if (!userData || !userData.token) {
        throw new Error("Datos de sesión inválidos");
      }

      // Agregar timestamp para control de expiración
      const sessionData = {
        ...userData,
        timestamp: Date.now(),
      };

      // Encriptar datos sensibles antes de almacenar
      const encryptedData = this.encryptSessionData(sessionData);
      localStorage.setItem(SESSION_KEY, encryptedData);

      this.initializeSessionCheck();
    } catch (error) {
      console.error("Error al guardar la sesión:", error);
      this.clearSession();
    }
  }

  // Obtener datos de sesión
  getSession() {
    try {
      const encryptedData = localStorage.getItem(SESSION_KEY);
      if (!encryptedData) return null;

      const sessionData = this.decryptSessionData(encryptedData);
      if (!this.isSessionValid(sessionData)) {
        this.clearSession();
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error("Error al obtener la sesión:", error);
      this.clearSession();
      return null;
    }
  }

  // Limpiar datos de sesión
  clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
      if (this.sessionCheckInterval) {
        clearInterval(this.sessionCheckInterval);
      }
    } catch (error) {
      console.error("Error al limpiar la sesión:", error);
    }
  }

  // Verificar validez de la sesión
  isSessionValid(sessionData) {
    if (!sessionData || !sessionData.timestamp || !sessionData.token) {
      return false;
    }

    // Verificar expiración del token
    const tokenData = this.parseJwt(sessionData.token);
    if (!tokenData || !tokenData.exp) {
      return false;
    }

    const now = Date.now() / 1000;
    return tokenData.exp > now;
  }

  // Verificar si la sesión necesita renovación
  needsRefresh(sessionData) {
    if (!sessionData || !sessionData.token) return false;

    const tokenData = this.parseJwt(sessionData.token);
    if (!tokenData || !tokenData.exp) return false;

    const now = Date.now() / 1000;
    return tokenData.exp * 1000 - Date.now() < TOKEN_REFRESH_THRESHOLD;
  }

  // Verificar periódicamente la validez de la sesión
  checkSessionValidity() {
    const session = this.getSession();
    if (!session) return;

    if (!this.isSessionValid(session)) {
      this.clearSession();
      window.dispatchEvent(new CustomEvent("sessionExpired"));
    } else if (this.needsRefresh(session)) {
      window.dispatchEvent(new CustomEvent("sessionNeedsRefresh"));
    }
  }

  // Utilidades para manejo seguro de datos
  parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error al parsear el token:", error);
      return null;
    }
  }

  // Método simple de encriptación (en producción usar métodos más seguros)
  encryptSessionData(data) {
    try {
      return btoa(JSON.stringify(data));
    } catch (error) {
      console.error("Error al encriptar datos:", error);
      throw error;
    }
  }

  // Método simple de desencriptación
  decryptSessionData(encryptedData) {
    try {
      return JSON.parse(atob(encryptedData));
    } catch (error) {
      console.error("Error al desencriptar datos:", error);
      throw error;
    }
  }
}

export const sessionService = new SessionService();
