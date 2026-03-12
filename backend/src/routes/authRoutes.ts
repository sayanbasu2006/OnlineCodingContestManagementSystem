import express from 'express';
import { registerUser, loginUser, getUsers, getCurrentUser, updateProfile, changePassword } from '../controllers/authController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', protect, admin, getUsers); // Protected - admin only

// Current user routes
router.get('/me', protect, getCurrentUser);
router.put('/me', protect, updateProfile);
router.put('/me/password', protect, changePassword);

export default router;
