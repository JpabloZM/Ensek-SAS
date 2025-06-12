// Inventory routes
import express from "express";
import {
  getInventoryItems,
  createInventoryItem,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
} from "../controllers/inventoryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rutas protegidas
router.get("/", protect, getInventoryItems);
router.post("/", protect, createInventoryItem);
router.get("/:id", protect, getInventoryItemById);
router.put("/:id", protect, updateInventoryItem);
router.delete("/:id", protect, deleteInventoryItem);

export default router;
