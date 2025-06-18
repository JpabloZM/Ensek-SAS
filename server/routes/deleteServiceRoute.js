import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("[deleteService] Starting with ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("[deleteService] Invalid ID format:", id);
      return res.status(400).json({
        success: false,
        message: "ID de servicio inválido",
      });
    }

    console.log("[deleteService] Attempting deletion");

    // Use direct MongoDB operation
    const result = await mongoose.connection.db
      .collection("services")
      .deleteOne({
        _id: new mongoose.Types.ObjectId(id),
      });

    console.log("[deleteService] Deletion result:", result);

    if (result.deletedCount === 0) {
      console.log("[deleteService] No document found to delete");
      return res.status(404).json({
        success: false,
        message: "Servicio no encontrado",
      });
    }

    console.log("[deleteService] Successfully deleted service");
    return res.status(200).json({
      success: true,
      message: "Servicio eliminado correctamente",
    });
  } catch (error) {
    console.error("[deleteService] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar el servicio",
      error: error.message,
    });
  }
});

export default router;
