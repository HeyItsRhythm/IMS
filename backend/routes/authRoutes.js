import express from 'express';
import { login, register, me, verifyEmail } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.post('/verify/:id', verifyEmail); // OTP-style path
router.get('/me', authenticateToken, me);

export default router;
