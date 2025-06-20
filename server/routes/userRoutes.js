// User routes
import express from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getTechnicians,
  createTechnician,
  getTechnicianById,
  updateTechnician,
  deleteTechnician,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log("\n=== Route Handler ===");
  console.log({
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    url: req.url,
    params: req.params,
    body: req.body,
  });
  next();
});

// Debug middleware for technician routes
router.use("/technicians", (req, res, next) => {
  console.log("\n=== Technician Route ===");
  console.log({
    method: req.method,
    path: req.path,
    id: req.params.id,
    originalUrl: req.originalUrl,
  });
  next();
});

// Technician routes - must be defined BEFORE generic routes to avoid conflicts
router.get("/technicians", protect, admin, getTechnicians);
router.post("/technicians", protect, admin, createTechnician);
router.get("/technicians/:id", protect, admin, getTechnicianById);
router.put("/technicians/:id", protect, admin, updateTechnician);
router.delete("/technicians/:id", protect, admin, deleteTechnician);

// Regular user routes
router.get("/", protect, admin, getUsers);
router.get("/:id", protect, admin, getUserById);
router.put("/:id", protect, admin, updateUser);
router.delete("/:id", protect, admin, deleteUser);

export default router;
