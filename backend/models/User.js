import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'company', 'admin'], default: 'student' },
  isVerified: { type: Boolean, default: false },
  course: { type: String, default: '' },
  year: { type: String, default: '' },
  skills: [{ type: String }],
  resume: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  companyName: { type: String, default: '' },
  location: { type: String, default: '' },
  description: { type: String, default: '' },
  approvalStatus: { type: String, enum: ['pending', 'active', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', userSchema);
