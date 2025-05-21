// Service routes
import express from 'express';
import {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateServiceRequestStatus,
} from '../controllers/serviceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create service request (public access)
router.post('/request', createServiceRequest);

// Get all service requests (admin only)
router.get('/requests', protect, admin, getServiceRequests);

// Get service request by ID
router.get('/requests/:id', protect, getServiceRequestById);

// Update service request status (admin only)
router.put('/requests/:id/status', protect, admin, updateServiceRequestStatus);

export default router;
