import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true }, // store plain or hashed
  createdAt: { type: Date, default: Date.now, expires: 300 } // auto delete after 5 min
});

export default mongoose.model("Otp", otpSchema);
