import express from 'express';
import { subscribeNewsletter, getSubscribers } from '../controllers/newsletterController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/subscribe', subscribeNewsletter);
router.get('/subscribers', protect, adminOnly, getSubscribers);

export default router;
