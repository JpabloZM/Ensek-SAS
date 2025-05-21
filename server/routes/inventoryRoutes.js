// Inventory routes
import express from 'express';
import {
  createInventoryItem,
  getInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
} from '../controllers/inventoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create inventory item (admin only)
router.post('/', protect, admin, createInventoryItem);

// Get all inventory items (admin only)
router.get('/', protect, admin, getInventoryItems);

// Get inventory item by ID (admin only)
router.get('/:id', protect, admin, getInventoryItemById);

// Update inventory item (admin only)
router.put('/:id', protect, admin, updateInventoryItem);

// Delete inventory item (admin only)
router.delete('/:id', protect, admin, deleteInventoryItem);

export default router;
