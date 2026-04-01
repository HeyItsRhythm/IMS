import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: String,
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  internshipTitle: String,
  grade: String,
  remarks: String,
  issuedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);
