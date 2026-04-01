import Internship from '../models/Internship.js';

export const getAllInternships = async (req, res) => {
  const internships = await Internship.find();
  res.json(internships);
};

export const getApprovedInternships = async (req, res) => {
  const internships = await Internship.find({ status: 'approved' });
  res.json(internships);
};

export const createInternship = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.user?.role === 'company') {
      payload.status = 'pending';
    }
    if (!payload.companyId && req.user?.role === 'company') {
      payload.companyId = req.user.id;
    }
    const internship = new Internship(payload);
    await internship.save();
    res.status(201).json(internship);
  } catch (error) {
    res.status(500).json({ message: 'Could not create internship', error: error.message });
  }
};

export const updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    res.json(internship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteInternship = async (req, res) => {
  try {
    await Internship.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
