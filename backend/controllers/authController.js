import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'replace-me';
const COMPANY_WHITELIST = (process.env.COMPANY_WHITELIST || '').split(',').map(e => e.trim()).filter(Boolean);

const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'All fields are required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    if (role === 'company' && COMPANY_WHITELIST.length > 0 && !COMPANY_WHITELIST.includes(email)) {
      return res.status(403).json({ message: 'Unauthorized for company role' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: role === 'student' ? false : true,
      status: 'active',
      companyName: role === 'company' ? name : '',
      approvalStatus: role === 'company' ? 'pending' : 'active'
    });
    await user.save();

    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.role === 'company' && user.approvalStatus === 'rejected') {
      return res.status(403).json({ message: 'Company registration rejected by admin' });
    }

    const token = generateToken(user);
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user', error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const userId = req.params.id || req.body?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required for verification' });
    }

    const user = await User.findByIdAndUpdate(userId, { isVerified: true }, { new: true }).select('-password');
    if (!user) {
      console.warn('verifyEmail: user not found for ID', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('verifyEmail: user verified', userId);
    res.json({ user, message: 'Email verified' });
  } catch (error) {
    console.error('verifyEmail error', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};
