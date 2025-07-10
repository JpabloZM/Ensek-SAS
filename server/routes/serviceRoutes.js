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
router.post("/", serviceController.createService); // Use createService for direct service creation
router.post("/request", serviceController.createServiceRequest);

// Rutas protegidas
router.get("/", protect, serviceController.getServices);
router.get("/requests", protect, serviceController.getServiceRequests);
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

export default router;
