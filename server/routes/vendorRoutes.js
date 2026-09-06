import express from 'express';
import {
  vendorRegister,
  vendorLogin,
  getVendorProfile,
  updateVendorProfile,
  getVendorDashboardStats,
  getVendorProducts,
  createVendorProduct,
  updateVendorProduct,
  deleteVendorProduct,
  getVendorOrders,
  getVendorOrderById,
  updateVendorOrderStatus,
} from '../controllers/vendorController.js';
import { protect, vendorOnly, vendorAnyStatus } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public vendor auth
router.post('/register', vendorRegister);
router.post('/login', vendorLogin);

// Protected vendor profile
router.get('/profile', protect, vendorAnyStatus, getVendorProfile);
router.put('/profile', protect, vendorAnyStatus, updateVendorProfile);

// Protected vendor dashboard
router.get('/dashboard/stats', protect, vendorOnly, getVendorDashboardStats);

// Protected vendor catalog management
router.get('/products', protect, vendorOnly, getVendorProducts);
router.post('/products', protect, vendorOnly, createVendorProduct);
router.put('/products/:id', protect, vendorOnly, updateVendorProduct);
router.delete('/products/:id', protect, vendorOnly, deleteVendorProduct);

// Protected vendor order fulfillment
router.get('/orders', protect, vendorOnly, getVendorOrders);
router.get('/orders/:id', protect, vendorOnly, getVendorOrderById);
router.put('/orders/:id/status', protect, vendorOnly, updateVendorOrderStatus);

export default router;
