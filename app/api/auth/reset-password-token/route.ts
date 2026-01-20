//app/api/auth/reset-password-tokon/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect  from "@/lib/config/database";
import User from "@/models/User";
import {mailSender} from "@/lib/utils/mailSender";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: `This email (${email}) is not registered.`,
      });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.token = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const url = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/update-password/${token}`;

    await mailSender(
      email,
      "Password Reset",
      `Your link for password reset is ${url}. Click this link to reset your password.`
    );

    return NextResponse.json({
      success: true,
      message: "Email sent successfully. Please check your inbox.",
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Error sending password reset email.",
      error: error.message,
    });
  }
}
