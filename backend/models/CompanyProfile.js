import mongoose from 'mongoose';

const companyProfileSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName: { type: String, required: true },
  industryType: { type: String, required: true },
  description: { type: String, default: '' },
  email: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.CompanyProfile || mongoose.model('CompanyProfile', companyProfileSchema);

