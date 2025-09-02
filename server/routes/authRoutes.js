// Authentication routes
import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  refreshToken,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Get user profile
router.get("/profile", protect, getUserProfile);

// Refresh token
router.post("/refresh-token", refreshToken);

export default router;
