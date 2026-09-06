import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getDealsAndTrending,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, adminOnly, createProduct);
router.get('/featured', getFeaturedProducts);
router.get('/deals', getDealsAndTrending);
router
  .route('/:id')
  .get(getProductById)
  .put(protect, adminOnly, updateProduct)
  .delete(protect, adminOnly, deleteProduct);
router.route('/:id/reviews').post(protect, createProductReview);

export default router;
