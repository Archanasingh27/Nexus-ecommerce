import express from 'express';
import {
  getDashboardAnalytics,
  getFlashSaleConfig,
  updateFlashSaleConfig,
  getAllVendors,
  updateVendorStatus,
  updateVendorByAdmin,
  deleteVendor,
  updateProductApprovalStatus,
  getDeliverySettings,
  updateDeliverySettings,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/analytics', protect, adminOnly, getDashboardAnalytics);
router
  .route('/flash-sale')
  .get(protect, adminOnly, getFlashSaleConfig)
  .put(protect, adminOnly, updateFlashSaleConfig);

// Delivery & Logistics Settings (Admin)
router
  .route('/delivery-settings')
  .get(protect, adminOnly, getDeliverySettings)
  .put(protect, adminOnly, updateDeliverySettings);

// Vendor Management (Admin)
router.get('/vendors', protect, adminOnly, getAllVendors);
router.put('/vendors/:id/status', protect, adminOnly, updateVendorStatus);
router.put('/vendors/:id', protect, adminOnly, updateVendorByAdmin);
router.delete('/vendors/:id', protect, adminOnly, deleteVendor);

// Product Approval (Admin)
router.put('/products/:id/approval', protect, adminOnly, updateProductApprovalStatus);

export default router;

