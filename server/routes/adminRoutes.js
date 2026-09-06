import express from 'express';
import {
  getDashboardAnalytics,
  getFlashSaleConfig,
  updateFlashSaleConfig,
  getAllVendors,
  updateVendorStatus,
  updateVendorByAdmin,
  deleteVendor,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/analytics', protect, adminOnly, getDashboardAnalytics);
router
  .route('/flash-sale')
  .get(protect, adminOnly, getFlashSaleConfig)
  .put(protect, adminOnly, updateFlashSaleConfig);

// Vendor Management (Admin)
router.get('/vendors', protect, adminOnly, getAllVendors);
router.put('/vendors/:id/status', protect, adminOnly, updateVendorStatus);
router.put('/vendors/:id', protect, adminOnly, updateVendorByAdmin);
router.delete('/vendors/:id', protect, adminOnly, deleteVendor);

export default router;

