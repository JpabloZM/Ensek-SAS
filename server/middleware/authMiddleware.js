// Authentication middleware
import User from "../models/userModel.js";
import { verifyToken } from "../config/jwt.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token with enhanced validation
      const decoded = verifyToken(token);

      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return res.status(401).json({
          success: false,
          message: "Token expirado, por favor inicie sesión nuevamente",
        });
      }

      // Get user from the token with role validation
      req.user = await User.findById(decoded.id).select("-password");

      if (!["admin", "user"].includes(req.user?.role)) {
        return res.status(401).json({
          success: false,
          message: "Rol de usuario inválido",
        });
      }

      if (!req.user) {
        console.log("No user found with decoded ID:", decoded.id);
        return res.status(401).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      console.log("User authenticated:", {
        id: req.user._id,
        role: req.user.role,
      });

      next();
    } catch (error) {
      console.error("Auth Error:", {
        message: error.message,
        type: error.name,
        token: token ? "Present" : "Missing",
      });
      return res.status(401).json({
        success: false,
        message: "No autorizado, token inválido",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  } else {
    console.log("No token provided in Authorization header");
    return res.status(401).json({
      success: false,
      message: "No autorizado, falta token de autenticación",
    });
  }
  console.log("=== Auth Middleware End ===\n");
};

// Admin middleware with enhanced logging
export const admin = (req, res, next) => {
  console.log("\n=== Admin Middleware ===");
  console.log({
    user: req.user
      ? {
          id: req.user._id,
          role: req.user.role,
        }
      : "No user",
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
  });

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Usuario no autenticado",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado - Se requieren permisos de administrador",
    });
  }

  // Log successful admin authorization
  console.log("Admin access granted for:", {
    userId: req.user._id,
    route: req.originalUrl,
    method: req.method,
  });

  next();
};
