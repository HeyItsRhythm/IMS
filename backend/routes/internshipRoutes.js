import express from 'express';
import { getAllInternships, createInternship, updateInternship, deleteInternship, getApprovedInternships } from '../controllers/internshipController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();
router.get('/', getAllInternships);
router.get('/approved', getApprovedInternships);
router.post('/', authenticateToken, authorizeRole('company', 'admin'), createInternship);
router.put('/:id', authenticateToken, authorizeRole('company', 'admin'), updateInternship);
router.delete('/:id', authenticateToken, authorizeRole('company', 'admin'), deleteInternship);

export default router;
