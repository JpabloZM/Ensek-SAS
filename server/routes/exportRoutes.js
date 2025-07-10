import express from "express";
import { exportToPdf, exportToCsv } from "../controllers/exportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Export routes for calendar data
 */

// Route for PDF export
router.get("/pdf", protect, exportToPdf);

// Route for CSV export
router.get("/csv", protect, exportToCsv);

// Combined route that decides format based on query parameter
router.get("/", protect, (req, res) => {
  const { format } = req.query;

  if (format === "pdf") {
    exportToPdf(req, res);
  } else if (format === "csv") {
    exportToCsv(req, res);
  } else {
    res.status(400).json({ message: "Formato no soportado. Use pdf o csv." });
  }
});

export default router;
