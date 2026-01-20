import mongoose from "mongoose";
import { mailSender } from "@/lib/utils/mailSender";
import emailVerificationTemplate from "@/lib/mail/templates/emailVerificationTemplate";

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // 5 min TTL
});

OTPSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      await mailSender(
        this.email,
        "Your OTP",
        emailVerificationTemplate(this.otp)
      );
      console.log(`✅ OTP sent to ${this.email}: ${this.otp}`);
    } catch (error) {
      console.error("❌ Email sending failed:", error);
      // In development, log the OTP to console if email fails
      console.log(`🔐 DEV MODE - OTP for ${this.email}: ${this.otp}`);
      // Don't throw error, allow OTP to be saved even if email fails
    }
  }
  next();
});

export default mongoose.models.OTP || mongoose.model("OTP", OTPSchema);