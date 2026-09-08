import express from 'express';
import {
  sendMessage,
  getConversations,
  getMessages,
  markMessagesAsRead,
  getAdminSupportInfo,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin-info', getAdminSupportInfo);
router.post('/send', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/messages/:partnerId', protect, getMessages);
router.put('/read/:partnerId', protect, markMessagesAsRead);

export default router;
