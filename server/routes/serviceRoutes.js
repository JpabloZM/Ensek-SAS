// Service routes
import express from "express";
const router = express.Router();
import * as serviceController from "../controllers/serviceController.js";
import { protect } from "../middleware/authMiddleware.js";

// Debug middleware
router.use((req, res, next) => {
  console.log("\n=== Service Route ===");
  console.log({
    method: req.method,
    url: req.url,
    path: req.path,
    params: req.params,
    id: req.params.id,
    body: req.body,
    headers: req.headers,
  });

  // Add response logging
  const oldJson = res.json;
  res.json = function (data) {
    console.log("Response data:", data);
    return oldJson.apply(res, arguments);
  };

  next();
});

// Rutas públicas
router.post("/", serviceController.createService); // Ruta principal para crear servicios (ahora usa ServiceRequest)
router.post("/request", serviceController.createServiceRequest); // Ruta alternativa para compatibilidad

// Rutas protegidas
router.get("/", protect, serviceController.getServices);
router.get("/requests", protect, serviceController.getServiceRequests);
router.get("/check-models", protect, serviceController.checkModels);
router.get("/:id", protect, serviceController.getServiceById);
router.put("/:id", protect, serviceController.updateService);
router.delete("/:id", protect, serviceController.deleteService);
router.put(
  "/:id/assign-technician",
  protect,
  serviceController.assignTechnicianToService
);
router.put(
  "/requests/:id/convert",
  protect,
  serviceController.convertServiceRequestToService
);

// Ruta de diagnóstico para verificar el estado de las colecciones
router.get("/diagnostics", protect, async (req, res) => {
  try {
    const serviceModelCount =
      await serviceController.ServiceModel.countDocuments();
    const serviceRequestCount =
      await serviceController.ServiceRequest.countDocuments();

    // Obtener algunos ejemplos de cada colección
    const serviceModelSamples = await serviceController.ServiceModel.find()
      .sort({ createdAt: -1 })
      .limit(5);
    const serviceRequestSamples = await serviceController.ServiceRequest.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      counts: {
        serviceModel: serviceModelCount,
        serviceRequest: serviceRequestCount,
      },
      samples: {
        serviceModel: serviceModelSamples,
        serviceRequest: serviceRequestSamples,
      },
      message:
        "Esta ruta ayuda a diagnosticar en qué colecciones se están guardando los servicios",
    });
  } catch (error) {
    console.error("Error en diagnóstico:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
