// User routes
import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', protect, admin, getUsers);

// Get user by ID (admin only)
router.get('/:id', protect, admin, getUserById);

// Update user (admin only)
router.put('/:id', protect, admin, updateUser);

// Delete user (admin only)
router.delete('/:id', protect, admin, deleteUser);

export default router;
