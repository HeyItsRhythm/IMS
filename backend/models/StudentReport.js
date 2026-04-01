import mongoose from 'mongoose';

const studentReportSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  reportTitle: String,
  reportContent: String,
  fileName: String,
  filePath: String,
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.models.StudentReport || mongoose.model('StudentReport', studentReportSchema);
