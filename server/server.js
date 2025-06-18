import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import seedInventory from "./config/seedData.js";
import { isUsingMockDB } from "./config/db.js";

// Importar rutas
import authRoutes from "./routes/authRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Configuración de variables de entorno
dotenv.config();

// Inicializar express
const app = express();

// Global Debug Middleware
app.use((req, res, next) => {
  console.log("========= Incoming Request =========");
  console.log(`${req.method} ${req.originalUrl}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("===================================");
  next();
});

// Middleware
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/users", userRoutes);

// Conectar a la base de datos
connectDB().then(async (conn) => {
  if (conn && !isUsingMockDB()) {
    // Inicializar datos de ejemplo solo si estamos usando MongoDB
    await seedInventory();
  }
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Puerto
const PORT = process.env.PORT || 5000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV || "development"}`);
  console.log(`Base de datos: ${isUsingMockDB() ? "MockDB" : "MongoDB"}`);
});
