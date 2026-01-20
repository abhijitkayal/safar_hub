// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import User from "@/models/User";
import Profile from "@/models/Profile";
import OTP from "@/models/OTP";
import { mailSender } from "@/lib/utils/mailSender";
import welcomeUserTemplate from "@/lib/mail/templates/welcomeUserTemplate";
import newUserAdminNotification from "@/lib/mail/templates/newUserAdminNotification";
import vendorPendingTemplate from "@/lib/mail/templates/vendorPendingTemplate";
import adminVendorNotification from "@/lib/mail/templates/adminVendorNotification";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      fullName,
      email,
      age,
      password,
      confirmPassword,
      contactNumber,
      accountType,
      otp,
      vendorServices,
      isSeller = false,
    } = body;

    if (
      !fullName ||
      !email ||
      !age ||
      !password ||
      !confirmPassword ||
      !contactNumber ||
      !otp
    ) {
      return NextResponse.json(
        { success: false, message: "All fields required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 }
      );
    }

    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord || otpRecord.otp !== otp) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );
    }

    if (await User.findOne({ email })) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    const sellerSelected = Boolean(isSeller);
    const normalizedAccountType =
      sellerSelected || accountType === "vendor" ? "vendor" : "user";
    const normalizedVendorServices =
      normalizedAccountType === "vendor" ? vendorServices || [] : [];

    const profile = await Profile.create({});

    const userDoc = await User.create({
      fullName,
      email,
      age: Number(age),
      password,
      contactNumber,
      accountType: normalizedAccountType,
      additionalDetails: profile._id,
      vendorServices: normalizedVendorServices,
      isVendorApproved: false, // default locked until admin approves
      isSeller: sellerSelected,
    });

    // Return a normalized user object (no password)
    const user = {
      _id: userDoc._id,
      fullName: userDoc.fullName,
      email: userDoc.email,
      contactNumber: userDoc.contactNumber,
      accountType: userDoc.accountType,
      vendorServices: userDoc.vendorServices,
      isVendorApproved: userDoc.isVendorApproved,
      isSeller: userDoc.isSeller,
      createdAt: userDoc.createdAt,
    };

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const emailTasks: Promise<unknown>[] = [];

    if (normalizedAccountType === "vendor") {
      emailTasks.push(
        mailSender(
          user.email,
          "SafarHub vendor application received",
          vendorPendingTemplate({ fullName: user.fullName })
        )
      );

      if (ADMIN_EMAIL) {
        emailTasks.push(
          mailSender(
            ADMIN_EMAIL,
            "New vendor applied on SafarHub",
            adminVendorNotification({
              fullName: user.fullName,
              email: user.email,
              contactNumber: user.contactNumber,
              age: Number(age),
              vendorServices: normalizedVendorServices,
            })
          )
        );
      }
    } else {
      emailTasks.push(
        mailSender(
          user.email,
          "Welcome to SafarHub",
          welcomeUserTemplate({ fullName: user.fullName })
        )
      );

      if (ADMIN_EMAIL) {
        emailTasks.push(
          mailSender(
            ADMIN_EMAIL,
            "New user joined SafarHub",
            newUserAdminNotification({
              fullName: user.fullName,
              email: user.email,
              contactNumber: user.contactNumber,
              age: Number(age),
              accountType: user.accountType,
              vendorServices: normalizedVendorServices,
            })
          )
        );
      }
    }

    await Promise.allSettled(emailTasks);

    return NextResponse.json({
      success: true,
      message: "Signup successful",
      user,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
