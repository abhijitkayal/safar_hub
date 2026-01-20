//app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import OTP from "@/models/OTP";
import User from "@/models/User";
import otpGenerator from "otp-generator";

const isValidEmail = (email: string) =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Valid email required" },
        { status: 400 }
      );
    }

    if (await User.findOne({ email })) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    let otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let unique = false;
    let tries = 0;
    while (!unique && tries < 5) {
      const exists = await OTP.findOne({ otp });
      if (!exists) unique = true;
      else otp = otpGenerator.generate(6, { digits: true });
      tries++;
    }

    await OTP.create({ email, otp });

    return NextResponse.json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (error: any) {
    console.error("❌ Error in send-otp:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}