import express from 'express';
import multer from 'multer';
import path from 'path';
import { getProfile, upsertProfile, deleteProfile, uploadProfileCv, uploadDocument, listDocuments, submitReport, listReports } from '../controllers/studentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 12 * 1024 * 1024 } });

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, upsertProfile);
router.delete('/profile', authenticateToken, deleteProfile);
router.post('/profile/cv', authenticateToken, upload.single('cv'), uploadProfileCv);
router.post('/documents', authenticateToken, upload.single('document'), uploadDocument);
router.get('/documents', authenticateToken, listDocuments);
router.post('/reports', authenticateToken, submitReport);
router.get('/reports', authenticateToken, listReports);

export default router;
