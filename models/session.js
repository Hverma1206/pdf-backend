import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String }, 
  otpExpiresAt: { type: Date },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true } 
}, { timestamps: true });

export default mongoose.model("Session", sessionSchema);
