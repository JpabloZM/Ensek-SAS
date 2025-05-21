// Server health check route to verify API availability
import express from 'express';
import { isUsingMockDB } from '../config/db.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    usingMockDB: isUsingMockDB(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;
