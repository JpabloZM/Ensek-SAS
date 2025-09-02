export const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    'manage_users',
    'manage_inventory',
    'manage_services',
    'view_reports',
    'manage_technicians'
  ],
  [ROLES.USER]: [
    'view_services',
    'request_service',
    'view_profile',
    'update_profile'
  ]
};

export const validateRole = (role) => {
  return Object.values(ROLES).includes(role);
};

export const hasPermission = (userRole, permission) => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

export const requiresPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permiso para realizar esta acción'
      });
    }

    next();
  };
};
