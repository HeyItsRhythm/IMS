import mongoose from 'mongoose';

const studentDocumentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: String,
  fileType: String,
  path: String,
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.models.StudentDocument || mongoose.model('StudentDocument', studentDocumentSchema);
