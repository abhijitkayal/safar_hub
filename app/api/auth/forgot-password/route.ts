import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/config/database";
import User from "@/models/User";
import { mailSender } from "@/lib/utils/mailSender";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email } = await req.json();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Email not registered" },
        { status: 400 }
      );
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.token = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    const url = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reset-password?token=${token}`;
    await mailSender(
      email,
      "Password Reset – Travels",
      `Click <a href="${url}">here</a> to reset. Link expires in 1 hour.`
    );

    return NextResponse.json({
      success: true,
      message: "Reset link sent",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}