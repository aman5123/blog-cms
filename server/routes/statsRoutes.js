import express from 'express';
import { getStats } from '../controllers/statsController.js';
import { protect, authorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorOrAdmin, getStats);

export default router;
