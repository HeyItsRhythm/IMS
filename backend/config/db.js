import mongoose from 'mongoose';
import ENV from './config.js';

export const connectDB = async () => {
  try {
    const MONGO_URI = ENV.MONGO_URI;
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
