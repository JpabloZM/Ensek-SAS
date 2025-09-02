// index.js - Main server file for ENSEK-SAS backend
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";

// Load environment variables
config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Must be defined BEFORE routes
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Debug middleware for all requests
app.use((req, res, next) => {
  console.log("\n=== Incoming Request ===");
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Original URL: ${req.originalUrl}`);
  console.log(`Base URL: ${req.baseUrl}`);
  console.log(`Path: ${req.path}`);
  console.log("Query:", req.query);
  console.log("Params:", req.params);
  console.log("Body:", req.body);
  next();
});

// Root route
app.get("/", (req, res) => {
  res.json({ message: "ENSEK-SAS API is running" });
});

// Debug middleware for all routes
app.use((req, res, next) => {
  console.log("\n=== API Request ===");
  console.log({
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    path: req.path,
  });
  next();
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/health", healthRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  console.error("Stack:", err.stack);
  res.status(500).json({
    success: false,
    message: "Error al procesar la solicitud",
    error: err.message,
  });
});

// 404 handler - Must be last
app.use((req, res) => {
  console.log("\n=== 404 Not Found ===");
  console.log({
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
  });
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    path: req.originalUrl,
  });
});

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");

    // Start server
    app.listen(PORT, () => {
      console.log(`\n=== Server Started ===`);
      console.log(`Server running on port ${PORT}`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log("Available routes:");
      console.log("- /api/auth");
      console.log("- /api/users");
      console.log("- /api/services");
      console.log("- /api/inventory");
      console.log("- /api/health");
    });
  } catch (error) {
    console.error(`\n=== Server Start Error ===`);
    console.error(`Failed to start server: ${error.message}`);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
};

// Start the server
startServer();
