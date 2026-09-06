import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, adminOnly, getAllUsers);
router
  .route('/:id')
  .get(protect, adminOnly, getUserById)
  .put(protect, adminOnly, updateUser)
  .delete(protect, adminOnly, deleteUser);
router.route('/:id/role').put(protect, adminOnly, updateUserRole);

export default router;
