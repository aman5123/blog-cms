import express from 'express';
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
} from '../controllers/postController.js';
import { protect, authorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getPosts)
  .post(protect, authorOrAdmin, createPost);

router.post('/:id/like', likePost);

router.route('/:slugOrId')
  .get(getPost);

router.route('/:id')
  .put(protect, authorOrAdmin, updatePost)
  .delete(protect, authorOrAdmin, deletePost);

export default router;
