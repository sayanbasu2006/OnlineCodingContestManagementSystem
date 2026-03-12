import express from 'express';
import { getUsers } from '../controllers/authController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Get all users (admin only)
router.get('/', protect, admin, getUsers);

export default router;
