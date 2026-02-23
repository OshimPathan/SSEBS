import express from 'express';
import { login, getProfile, changePassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);
router.put('/change-password', authenticateToken, changePassword);

export default router;
