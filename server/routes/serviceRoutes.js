// Service routes
import express from 'express';
const router = express.Router();
import * as serviceController from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';

// Rutas públicas
router.post('/', serviceController.createService);

// Rutas protegidas
router.get('/', protect, serviceController.getServices);
router.get('/:id', protect, serviceController.getServiceById);
router.put('/:id', protect, serviceController.updateService);
router.delete('/:id', protect, serviceController.deleteService);

export default router;
