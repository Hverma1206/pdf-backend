import express from "express";
import jwt from "jsonwebtoken";
import Session from "../models/session.js";
import { generateOtp, isOtpExpired } from "../utils/otp.js";
import { sendSms } from "../utils/sns.js";
const router = express.Router();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TTL = parseInt(process.env.ACCESS_TTL_SECONDS, 10);
const REFRESH_TTL = parseInt(process.env.REFRESH_TTL_SECONDS, 10);

router.post("/request-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone required" });

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
  const expiresAt = new Date(Date.now() + REFRESH_TTL * 1000);

  let session = await Session.findOne({ phone });
  if (session) {
    session.otp = otp;
    session.otpExpiresAt = otpExpiresAt;
    session.verified = false;
    session.expiresAt = expiresAt;
    await session.save();
  } else {
    session = await Session.create({ phone, otp, otpExpiresAt, expiresAt });
  }

  // TODO: send OTP using AWS SNS instead of console
  console.log(`OTP for ${phone}: ${otp}`);
  
await sendSms(phone, `Your OTP is ${otp}. It will expire in 5 minutes.`);

  res.json({ message: "OTP sent" });
});

router.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;
  const session = await Session.findOne({ phone });

  if (!session) return res.status(400).json({ message: "No session found" });
  if (!session.otp || session.otp !== otp)
    return res.status(400).json({ message: "Invalid OTP" });
  if (isOtpExpired(session.otpExpiresAt))
    return res.status(400).json({ message: "OTP expired" });

  session.verified = true;
  session.otp = null;
  await session.save();

  const accessToken = jwt.sign({ phone }, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
  const refreshToken = jwt.sign({ phone }, REFRESH_SECRET, { expiresIn: REFRESH_TTL });

  res.json({ accessToken, refreshToken });
});

router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, REFRESH_SECRET, (err, payload) => {
    if (err) return res.sendStatus(403);

    const accessToken = jwt.sign({ phone: payload.phone }, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
    res.json({ accessToken });
  });
});

export default router;
