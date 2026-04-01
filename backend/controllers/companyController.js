import CompanyProfile from '../models/CompanyProfile.js';
import User from '../models/User.js';
import Internship from '../models/Internship.js';

const REQUIRED_FIELDS = [
  'companyName',
  'industryType',
  'email',
  'country',
  'state',
  'city',
];

export const getCompanyProfile = async (req, res) => {
  const profile = await CompanyProfile.findOne({ companyId: req.user.id });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
};

export const upsertCompanyProfile = async (req, res) => {
  const data = req.body || {};

  const missing = REQUIRED_FIELDS.filter(
    (f) => !data[f] || (Array.isArray(data[f]) ? data[f].length === 0 : !String(data[f]).trim())
  );
  if (missing.length) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
  }

  // Ensure the company is linked to the authenticated user.
  const payload = {
    companyId: req.user.id,
    companyName: String(data.companyName).trim(),
    industryType: String(data.industryType).trim(),
    description: String(data.description || '').trim(),
    email: String(data.email).trim(),
    country: String(data.country).trim(),
    state: String(data.state).trim(),
    city: String(data.city).trim(),
    updatedAt: new Date(),
  };

  const profile = await CompanyProfile.findOneAndUpdate(
    { companyId: req.user.id },
    payload,
    { upsert: true, new: true }
  );

  res.json(profile);
};

export const getCompanyPartnership = async (req, res) => {
  const [user, profile, postsCount] = await Promise.all([
    User.findById(req.user.id).select('name email approvalStatus'),
    CompanyProfile.findOne({ companyId: req.user.id }),
    Internship.countDocuments({ companyId: String(req.user.id) })
  ]);

  if (!user) return res.status(404).json({ message: 'Company not found' });

  const location = profile
    ? [profile.city, profile.state, profile.country].filter(Boolean).join(', ')
    : '';

  res.json({
    companyName: profile?.companyName || user.name || '',
    email: profile?.email || user.email || '',
    industryType: profile?.industryType || 'Not set',
    address: location || 'Not set',
    approvalStatus: user.approvalStatus || 'pending',
    posts: postsCount
  });
};

