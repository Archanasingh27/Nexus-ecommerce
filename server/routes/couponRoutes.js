import express from 'express';
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
} from '../controllers/couponController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Customer validation route
router.post('/validate', validateCoupon);

// Admin Coupon Management routes
router.get('/', protect, adminOnly, getCoupons);
router.post('/', protect, adminOnly, createCoupon);
router.put('/:id', protect, adminOnly, updateCoupon);
router.put('/:id/toggle', protect, adminOnly, toggleCouponStatus);
router.delete('/:id', protect, adminOnly, deleteCoupon);

export default router;
