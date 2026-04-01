import StudentProfile from '../models/StudentProfile.js';
import StudentDocument from '../models/StudentDocument.js';
import StudentReport from '../models/StudentReport.js';

export const getProfile = async (req, res) => {
  const profile = await StudentProfile.findOne({ studentId: req.user.id });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
};

export const upsertProfile = async (req, res) => {
  const data = req.body;

  const requiredFields = ['degree', 'branch', 'collegeName', 'universityName', 'passingYear', 'cgpa', 'skills'];
  const missing = requiredFields.filter(f => !data[f] || (Array.isArray(data[f]) ? data[f].length === 0 : !String(data[f]).trim()));
  if (missing.length) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
  }

  const payload = {
    studentId: req.user.id,
    fullName: req.user.name || data.fullName,
    email: req.user.email || data.email,
    degree: data.degree,
    branch: data.branch,
    collegeName: data.collegeName,
    universityName: data.universityName,
    passingYear: data.passingYear,
    cgpa: data.cgpa,
    skills: Array.isArray(data.skills) ? data.skills : String(data.skills).split(',').map(s => s.trim()).filter(Boolean),
    cvUrl: data.cvUrl || undefined,
    updatedAt: new Date()
  };

  const profile = await StudentProfile.findOneAndUpdate(
    { studentId: req.user.id },
    payload,
    { upsert: true, new: true }
  );

  res.json(profile);
};

export const uploadProfileCv = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No CV file uploaded' });

  const cvUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}`;
  const profile = await StudentProfile.findOneAndUpdate(
    { studentId: req.user.id },
    { cvUrl, updatedAt: new Date() },
    { upsert: true, new: true }
  );

  res.status(201).json({ cvUrl, profile });
};

export const uploadDocument = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const doc = new StudentDocument({
    studentId: req.user.id,
    fileName: req.file.originalname,
    fileType: req.file.mimetype,
    path: req.file.path
  });
  await doc.save();
  res.status(201).json(doc);
};

export const listDocuments = async (req, res) => {
  const docs = await StudentDocument.find({ studentId: req.user.id });
  res.json(docs);
};

export const submitReport = async (req, res) => {
  const { internshipId, reportTitle, reportContent } = req.body;
  if (!internshipId || !reportTitle || !reportContent) return res.status(400).json({ message: 'Missing required fields' });

  const report = new StudentReport({
    studentId: req.user.id,
    internshipId,
    reportTitle,
    reportContent,
    submittedAt: new Date()
  });
  await report.save();
  res.status(201).json(report);
};

export const deleteProfile = async (req, res) => {
  const profile = await StudentProfile.findOneAndDelete({ studentId: req.user.id });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json({ message: 'Profile deleted' });
};

export const listReports = async (req, res) => {
  const reports = await StudentReport.find({ studentId: req.user.id });
  res.json(reports);
};
