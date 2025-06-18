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

const router = express.Router({ mergeParams: true });

// Debug middleware
router.use((req, res, next) => {
  console.log("\n=== Route Handler ===");
  console.log({
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    params: req.params,
  });
  next();
});

// Technician routes - Must be defined BEFORE generic routes
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
