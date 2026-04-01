import Application from '../models/Application.js';
import Internship from '../models/Internship.js';

export const createApplication = async (req, res) => {
  try {
    const internship = await Internship.findById(req.body.internshipId);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    if (internship.status !== 'approved') {
      return res.status(400).json({ message: 'This internship is not available for applications yet' });
    }

    const application = new Application({
      ...req.body,
      studentId: req.user.id,
      studentName: req.body.studentName,
      appliedAt: new Date()
    });
    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getApplications = async (req, res) => {
  if (req.user.role === 'admin') {
    const applications = await Application.find();
    return res.json(applications);
  }

  if (req.user.role === 'company') {
    const internships = await Internship.find({ companyId: req.user.id });
    const internshipIds = internships.map(i => i._id);
    const applications = await Application.find({ internshipId: { $in: internshipIds } });
    return res.json(applications);
  }

  if (req.user.role === 'student') {
    const applications = await Application.find({ studentId: req.user.id });
    return res.json(applications);
  }

  res.status(403).json({ message: 'Forbidden' });
};

export const getApplicationsByStudent = async (req, res) => {
  const applications = await Application.find({ studentId: req.user.id });
  res.json(applications);
};

export const getApplicationsByCompany = async (req, res) => {
  if (req.user.role !== 'company' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const internships = await Internship.find({ companyId: req.user.id });
  const internshipIds = internships.map(i => i._id);
  const applications = await Application.find({ internshipId: { $in: internshipIds } });
  res.json(applications);
};

const VALID_STATUSES = ['pending', 'shortlisted', 'selected', 'approved', 'rejected'];

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (req.user.role === 'company') {
      const internship = await Internship.findById(application.internshipId);
      if (!internship || String(internship.companyId) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Unauthorized to modify this application' });
      }
    }

    application.status = status;
    await application.save();

    // ensure selected status is mapped for eventual certification
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
