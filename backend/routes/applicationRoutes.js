import express from 'express';
import { createApplication, getApplications, getApplicationsByStudent, getApplicationsByCompany, updateApplicationStatus } from '../controllers/applicationController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();
router.get('/', authenticateToken, authorizeRole('admin', 'company', 'student'), getApplications);
router.get('/me', authenticateToken, authorizeRole('student'), getApplicationsByStudent);
router.get('/company', authenticateToken, authorizeRole('company', 'admin'), getApplicationsByCompany);
router.post('/', authenticateToken, authorizeRole('student'), createApplication);
router.put('/:id', authenticateToken, authorizeRole('company', 'admin'), updateApplicationStatus);

export default router;
