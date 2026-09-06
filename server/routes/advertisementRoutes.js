import express from 'express';
import {
  getPublicAdvertisements,
  getAdminAdvertisements,
  getAdvertisementById,
  createAdvertisement,
  updateAdvertisement,
  toggleAdvertisementStatus,
  deleteAdvertisement,
} from '../controllers/advertisementController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for storefront banners
router.get('/', getPublicAdvertisements);

// Admin routes
router.get('/admin', protect, adminOnly, getAdminAdvertisements);
router.post('/', protect, adminOnly, createAdvertisement);

router
  .route('/:id')
  .get(getAdvertisementById)
  .put(protect, adminOnly, updateAdvertisement)
  .delete(protect, adminOnly, deleteAdvertisement);

router.patch('/:id/toggle', protect, adminOnly, toggleAdvertisementStatus);

export default router;
