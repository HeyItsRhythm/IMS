import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import StudentReport from '../models/StudentReport.js';
import Internship from '../models/Internship.js';
import CompanyProfile from '../models/CompanyProfile.js';
// import ENV from '../config/config.js';
const sanitize = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  isVerified: u.isVerified,
  course: u.course || '',
  year: u.year || '',
  skills: Array.isArray(u.skills) ? u.skills : [],
  resume: u.resume || '',
  status: u.status || 'active',
  companyName: u.companyName || u.name || '',
  location: u.location || '',
  description: u.description || '',
  industryType: u.industryType || '',
  address: u.address || '',
  country: u.country || '',
  state: u.state || '',
  city: u.city || '',
  approvalStatus: u.approvalStatus || (u.role === 'company' ? 'pending' : 'active'),
  createdAt: u.createdAt
});

const parseSkills = (skills) => {
  if (Array.isArray(skills)) return skills.map((s) => String(s).trim()).filter(Boolean);
  if (!skills) return [];
  return String(skills).split(',').map((s) => s.trim()).filter(Boolean);
};

/** Merge User with StudentProfile (MongoDB) for course, passing year, skills — profile wins when set. */
const enrichStudentUser = (user, profileMap) => {
  const u = user.toObject ? user.toObject() : { ...user };
  const p = profileMap.get(String(u._id));
  const courseFromProfile = p ? [p.degree, p.branch].filter(Boolean).join(' — ') : '';
  const course = courseFromProfile || u.course || '';
  const year =
    p && p.passingYear != null && String(p.passingYear).trim() !== ''
      ? String(p.passingYear).trim()
      : u.year || '';
  const skills =
    p && Array.isArray(p.skills) && p.skills.length ? p.skills : Array.isArray(u.skills) ? u.skills : [];
  return { ...u, course, year, skills };
};

export const listUsers = async (_req, res) => {
  const users = await User.find({}, '-password').sort({ createdAt: -1 });
  res.json(users.map(sanitize));
};

export const listStudents = async (req, res) => {
  const { q = '' } = req.query;
  const users = await User.find({ role: 'student' }, '-password').sort({ createdAt: -1 });
  const studentIds = users.map((u) => u._id);
  const profiles = await StudentProfile.find({ studentId: { $in: studentIds } });
  const profileMap = new Map(profiles.map((p) => [String(p.studentId), p]));

  const enriched = users.map((u) => enrichStudentUser(u, profileMap));

  const lcQ = String(q).toLowerCase().trim();
  const filtered = enriched.filter((u) => {
    if (!lcQ) return true;
    const skillsStr = (Array.isArray(u.skills) ? u.skills : []).join(' ');
    const haystack = [u.name, u.email, u.course, u.year, skillsStr]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(lcQ);
  });
  res.json(filtered.map(sanitize));
};

export const createStudent = async (req, res) => {
  const { name, email, password, course, year, skills, resume, status } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already exists' });
  const hashedPassword = await bcrypt.hash(String(password), 10);
  const user = await User.create({
    name: String(name).trim(),
    email: String(email).trim(),
    password: hashedPassword,
    role: 'student',
    isVerified: false,
    course: String(course || '').trim(),
    year: String(year || '').trim(),
    skills: parseSkills(skills),
    resume: String(resume || '').trim(),
    status: status === 'inactive' ? 'inactive' : 'active',
    approvalStatus: 'active'
  });
  res.status(201).json(sanitize(user));
};

export const updateStudent = async (req, res) => {
  const { id } = req.params;
  const payload = req.body || {};
  const user = await User.findOne({ _id: id, role: 'student' });
  if (!user) return res.status(404).json({ message: 'Student not found' });
  user.name = payload.name !== undefined ? String(payload.name).trim() : user.name;
  user.email = payload.email !== undefined ? String(payload.email).trim() : user.email;
  user.course = payload.course !== undefined ? String(payload.course).trim() : user.course;
  user.year = payload.year !== undefined ? String(payload.year).trim() : user.year;
  user.skills = payload.skills !== undefined ? parseSkills(payload.skills) : user.skills;
  user.resume = payload.resume !== undefined ? String(payload.resume).trim() : user.resume;
  user.status = payload.status === 'inactive' ? 'inactive' : (payload.status === 'active' ? 'active' : user.status);
  await user.save();

  const profiles = await StudentProfile.find({ studentId: user._id });
  const profileMap = new Map(profiles.map((p) => [String(p.studentId), p]));
  const merged = enrichStudentUser(user, profileMap);
  res.json(sanitize(merged));
};

export const deleteStudent = async (req, res) => {
  const { id } = req.params;
  const deleted = await User.findOneAndDelete({ _id: id, role: 'student' });
  if (!deleted) return res.status(404).json({ message: 'Student not found' });
  await StudentProfile.deleteMany({ studentId: id });
  res.json({ message: 'Student deleted' });
};

export const listCompanies = async (req, res) => {
  const { q = '', approvalStatus = '' } = req.query;
  const users = await User.find({ role: 'company' }, '-password').sort({ createdAt: -1 });
  const companyIds = users.map((u) => u._id);
  const profiles = await CompanyProfile.find({ companyId: { $in: companyIds } });
  const profileMap = new Map(
    profiles.map((p) => [String(p.companyId), p])
  );

  const enriched = users.map((u) => {
    const p = profileMap.get(String(u._id));
    const profileLocation = p ? [p.city, p.state, p.country].filter(Boolean).join(', ') : '';
    return {
      ...u.toObject(),
      industryType: p?.industryType || '',
      address: profileLocation,
      location: profileLocation || u.location || '',
      description: p ? String(p.description ?? '') : String(u.description || ''),
      country: p?.country || '',
      state: p?.state || '',
      city: p?.city || ''
    };
  });

  const lcQ = String(q).toLowerCase().trim();
  const filtered = enriched.filter((u) => {
    if (approvalStatus && (u.approvalStatus || 'pending').toLowerCase() !== String(approvalStatus).toLowerCase()) return false;
    if (!lcQ) return true;
    return [u.companyName || u.name, u.email, u.location, u.description, u.industryType, u.address]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(lcQ);
  });
  res.json(filtered.map(sanitize));
};

export const updateCompany = async (req, res) => {
  const { id } = req.params;
  const payload = req.body || {};
  const user = await User.findOne({ _id: id, role: 'company' });
  if (!user) return res.status(404).json({ message: 'Company not found' });
  user.companyName = payload.companyName !== undefined ? String(payload.companyName).trim() : user.companyName;
  user.email = payload.email !== undefined ? String(payload.email).trim() : user.email;
  await user.save();

  const profile = await CompanyProfile.findOne({ companyId: id });
  if (profile) {
    if (payload.description !== undefined) profile.description = String(payload.description).trim();
    if (payload.country !== undefined) profile.country = String(payload.country).trim();
    if (payload.state !== undefined) profile.state = String(payload.state).trim();
    if (payload.city !== undefined) profile.city = String(payload.city).trim();
    if (payload.companyName !== undefined) profile.companyName = String(payload.companyName).trim();
    if (payload.email !== undefined) profile.email = String(payload.email).trim();
    profile.updatedAt = new Date();
    await profile.save();
  }

  const p = await CompanyProfile.findOne({ companyId: id });
  const profileLocation = p ? [p.city, p.state, p.country].filter(Boolean).join(', ') : '';
  const responseUser = {
    ...user.toObject(),
    industryType: p?.industryType || '',
    address: profileLocation,
    location: profileLocation || user.location || '',
    description: p ? String(p.description ?? '') : String(user.description || ''),
    country: p?.country || '',
    state: p?.state || '',
    city: p?.city || ''
  };
  res.json(sanitize(responseUser));
};

export const updateCompanyApproval = async (req, res) => {
  const { id } = req.params;
  const { approvalStatus } = req.body || {};
  if (!['pending', 'active', 'rejected'].includes(approvalStatus)) {
    return res.status(400).json({ message: 'Invalid approval status' });
  }
  const user = await User.findOne({ _id: id, role: 'company' });
  if (!user) return res.status(404).json({ message: 'Company not found' });
  user.approvalStatus = approvalStatus;
  user.isVerified = approvalStatus === 'active' ? true : user.isVerified;
  await user.save();
  res.json(sanitize(user));
};

export const listInstitutionalReports = async (_req, res) => {
  const [reports, users, internships] = await Promise.all([
    StudentReport.find({}).sort({ submittedAt: -1 }),
    User.find({}, '_id name email'),
    Internship.find({}, '_id title companyName')
  ]);

  const userMap = new Map(users.map((u) => [String(u._id), u]));
  const internshipMap = new Map(internships.map((i) => [String(i._id), i]));

  const result = reports.map((r) => {
    const student = userMap.get(String(r.studentId));
    const internship = internshipMap.get(String(r.internshipId));
    return {
      _id: r._id,
      studentId: r.studentId,
      studentName: student?.name || 'Unknown Student',
      studentEmail: student?.email || '',
      internshipId: r.internshipId,
      internshipTitle: internship?.title || 'Internship',
      companyName: internship?.companyName || '',
      reportTitle: r.reportTitle || '',
      reportContent: r.reportContent || '',
      submittedAt: r.submittedAt
    };
  });

  res.json(result);
};

export const deleteInstitutionalReport = async (req, res) => {
  const { id } = req.params;
  const deleted = await StudentReport.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: 'Report not found' });
  res.json({ message: 'Report deleted' });
};
