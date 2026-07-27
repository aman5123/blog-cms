import express from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect, authorOrAdmin, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, authorOrAdmin, createCategory);

router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
