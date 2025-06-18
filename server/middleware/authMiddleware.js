// Authentication middleware
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  console.log("\n=== Auth Middleware Start ===");
  console.log("Request URL:", req.originalUrl);
  console.log("Request Method:", req.method);
  console.log("Auth Headers:", req.headers.authorization);

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];
      console.log("Token extracted:", token ? "Present" : "Missing");

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded successfully. User ID:", decoded.id);

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");

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
