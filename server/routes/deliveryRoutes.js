import express from 'express';
import {
  deliveryLogin,
  getDeliveryProfile,
  toggleAvailability,
  getAvailableOrders,
  getMyActiveDeliveries,
  getMyDeliveryHistory,
  acceptOrder,
  rejectOrder,
  updateDeliveryStatus,
  adminGetDeliveryPartners,
  adminCreateDeliveryPartner,
  adminUpdateDeliveryPartner,
  adminDeleteDeliveryPartner,
} from '../controllers/deliveryController.js';
import { protect, adminOnly, deliveryOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Rider Login
router.post('/login', deliveryLogin);

// Protected Rider Operations
router.get('/profile', protect, deliveryOnly, getDeliveryProfile);
router.put('/toggle-availability', protect, deliveryOnly, toggleAvailability);
router.get('/available-orders', protect, deliveryOnly, getAvailableOrders);
router.get('/active-orders', protect, deliveryOnly, getMyActiveDeliveries);
router.get('/history', protect, deliveryOnly, getMyDeliveryHistory);
router.put('/orders/:id/accept', protect, deliveryOnly, acceptOrder);
router.put('/orders/:id/reject', protect, deliveryOnly, rejectOrder);
router.put('/orders/:id/status', protect, deliveryOnly, updateDeliveryStatus);

// Admin Delivery Fleet Management
router.get('/admin/riders', protect, adminOnly, adminGetDeliveryPartners);
router.post('/admin/riders', protect, adminOnly, adminCreateDeliveryPartner);
router.put('/admin/riders/:id', protect, adminOnly, adminUpdateDeliveryPartner);
router.delete('/admin/riders/:id', protect, adminOnly, adminDeleteDeliveryPartner);

export default router;
