import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import Certificate from '../models/Certificate.js';

const router = express.Router();

router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const certs = await Certificate.find();
  res.json(certs);
});

router.get('/company', authenticateToken, authorizeRole('company', 'admin'), async (req, res) => {
  const certs = await Certificate.find({ companyId: req.user.id });
  res.json(certs);
});

router.get('/student', authenticateToken, authorizeRole('student', 'admin'), async (req, res) => {
  const certs = await Certificate.find({ studentId: req.user.id });
  res.json(certs);
});

router.post('/', authenticateToken, authorizeRole('company', 'admin'), async (req, res) => {
  try {
    const cert = new Certificate(req.body);
    await cert.save();
    res.status(201).json(cert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
