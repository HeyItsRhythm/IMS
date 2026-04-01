import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  degree: { type: String, required: true },
  branch: { type: String, required: true },
  collegeName: { type: String, required: true },
  universityName: { type: String, required: true },
  passingYear: { type: String, required: true },
  cgpa: { type: String, required: true },
  skills: { type: [String], required: true },
  cvUrl: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.StudentProfile || mongoose.model('StudentProfile', studentProfileSchema);
