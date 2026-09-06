import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrderToPaid,
  cancelOrder,
  getRazorpayKey,
  createRazorpayOrder,
  verifyRazorpayPayment,
  requestOrderReturn,
  reviewOrderReturn,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, adminOnly, getAllOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/razorpay/key').get(getRazorpayKey);
router.route('/razorpay/create-order').post(protect, createRazorpayOrder);
router.route('/razorpay/verify').post(protect, verifyRazorpayPayment);

router.route('/:id').get(protect, getOrderById);
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/return').post(protect, requestOrderReturn);
router.route('/:id/return/review').put(protect, reviewOrderReturn);
router.route('/:id/status').put(protect, adminOnly, updateOrderStatus);
router.route('/:id/pay').put(protect, updateOrderToPaid);

export default router;


