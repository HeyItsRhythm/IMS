import mongoose from 'mongoose';

const internshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: String,
  stipend: String,
  duration: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  companyId: String,
  companyName: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Internship || mongoose.model('Internship', internshipSchema);
