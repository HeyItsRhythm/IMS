import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { getCompanyProfile, upsertCompanyProfile, getCompanyPartnership } from '../controllers/companyController.js';

const router = express.Router();

router.get('/profile', authenticateToken, authorizeRole('company', 'admin'), getCompanyProfile);
router.put('/profile', authenticateToken, authorizeRole('company', 'admin'), upsertCompanyProfile);
router.get('/partnership', authenticateToken, authorizeRole('company', 'admin'), getCompanyPartnership);

export default router;

