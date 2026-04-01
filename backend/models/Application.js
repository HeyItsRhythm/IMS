import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: String,
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  internshipTitle: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'shortlisted', 'selected', 'approved', 'rejected'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Application || mongoose.model('Application', applicationSchema);
