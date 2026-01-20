import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import OTP from "@/models/OTP";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, otp } = await req.json();

    const record = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!record || record.otp !== otp) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "OTP verified" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}