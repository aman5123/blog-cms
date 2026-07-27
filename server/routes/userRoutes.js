import express from 'express';
import {
  getUsers,
  updateUserRole,
  deleteUser,
  followUser,
  toggleBookmark,
  updateProfile,
  changePassword,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, adminOnly, getUsers);
router.put('/:id/role', protect, adminOnly, updateUserRole);
router.delete('/:id', protect, adminOnly, deleteUser);
router.post('/:id/follow', protect, followUser);
router.post('/bookmarks/:postId', protect, toggleBookmark);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

export default router;
