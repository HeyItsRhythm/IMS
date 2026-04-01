import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import {
  listUsers,
  listStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  listCompanies,
  updateCompany,
  updateCompanyApproval,
  listInstitutionalReports,
  deleteInstitutionalReport
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticateToken, authorizeRole('admin'));

router.get('/users', listUsers);

router.get('/students', listStudents);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

router.get('/companies', listCompanies);
router.put('/companies/:id', updateCompany);
router.patch('/companies/:id/approval', updateCompanyApproval);

router.get('/reports', listInstitutionalReports);
router.delete('/reports/:id', deleteInstitutionalReport);

export default router;
