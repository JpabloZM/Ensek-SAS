// Definición de rutas y sus permisos
export const ROUTE_CONFIG = {
  // Rutas públicas
  public: {
    login: "/login",
    register: "/registro",
    welcome: "/welcome",
    home: "/",
    authDebug: "/auth-debug",
  },

  // Rutas para usuarios normales
  user: {
    dashboard: "/cliente",
    services: "/cliente/servicios",
    profile: "/cliente/perfil",
    requestService: "/cliente/solicitar-servicio",
  },

  // Rutas para administradores
  admin: {
    dashboard: "/admin/calendario",
    inventory: "/admin/inventario",
    users: "/admin/usuarios",
    services: "/admin/servicios",
    reports: "/admin/reportes",
    technicians: "/admin/tecnicos",
    profile: "/admin/perfil",
  },
};

// Configuración de redirecciones post-login
export const POST_LOGIN_REDIRECTS = {
  admin: ROUTE_CONFIG.admin.dashboard,
  user: ROUTE_CONFIG.user.dashboard,
  default: ROUTE_CONFIG.public.welcome,
};

// Configuración de rutas protegidas
export const PROTECTED_ROUTES = {
  // Rutas que requieren autenticación pero no un rol específico
  authenticated: ["/perfil", "/cambiar-password"],

  // Rutas específicas para usuarios
  user: Object.values(ROUTE_CONFIG.user),

  // Rutas específicas para administradores
  admin: Object.values(ROUTE_CONFIG.admin),
};

// Configuración de fallbacks para rutas no autorizadas
export const UNAUTHORIZED_REDIRECTS = {
  authenticated: ROUTE_CONFIG.public.login,
  user: ROUTE_CONFIG.user.dashboard,
  admin: ROUTE_CONFIG.admin.dashboard,
};

// Utilidad para verificar si una ruta está protegida
export const isProtectedRoute = (path) => {
  return [
    ...PROTECTED_ROUTES.authenticated,
    ...PROTECTED_ROUTES.user,
    ...PROTECTED_ROUTES.admin,
  ].some((route) => path.startsWith(route));
};

// Utilidad para verificar si una ruta requiere un rol específico
export const requiredRoleForRoute = (path) => {
  if (PROTECTED_ROUTES.admin.some((route) => path.startsWith(route))) {
    return "admin";
  }
  if (PROTECTED_ROUTES.user.some((route) => path.startsWith(route))) {
    return "user";
  }
  return null;
};

// Utilidad para obtener la redirección post-login según el rol
export const getPostLoginRedirect = (role, intendedPath = null) => {
  // Si hay una ruta intentada y el usuario tiene permisos para ella, redirigir ahí
  if (intendedPath && hasPermissionForRoute(role, intendedPath)) {
    return intendedPath;
  }

  // Si no, usar la redirección por defecto según el rol
  return POST_LOGIN_REDIRECTS[role] || POST_LOGIN_REDIRECTS.default;
};

// Utilidad para verificar si un usuario tiene permiso para una ruta
export const hasPermissionForRoute = (role, path) => {
  const requiredRole = requiredRoleForRoute(path);

  if (!requiredRole) {
    return true; // Ruta pública
  }

  if (role === "admin") {
    return true; // Los administradores tienen acceso a todo
  }

  if (role === "user" && requiredRole === "user") {
    return true; // Usuarios tienen acceso a rutas de usuario
  }

  return false;
};
