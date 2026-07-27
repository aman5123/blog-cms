import express from 'express';
import {
  getComments,
  createComment,
  updateCommentStatus,
  deleteComment,
} from '../controllers/commentController.js';
import { protect, authorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getComments)
  .post(createComment);

router.route('/:id/status')
  .put(protect, authorOrAdmin, updateCommentStatus);

router.route('/:id')
  .delete(protect, authorOrAdmin, deleteComment);

export default router;
