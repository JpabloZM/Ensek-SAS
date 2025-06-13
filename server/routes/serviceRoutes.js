// Service routes
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/', serviceController.createService);

// Rutas protegidas
router.get('/', protect, serviceController.getServices);
router.get('/:id', protect, serviceController.getServiceById);
router.put('/:id', protect, serviceController.updateService);
router.delete('/:id', protect, serviceController.deleteService);

module.exports = router;
