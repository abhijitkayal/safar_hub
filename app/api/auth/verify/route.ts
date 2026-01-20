import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import User from "@/models/User";
import "@/models/Profile";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // ✅ Handle fixed admin
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    if (
      ADMIN_EMAIL &&
      decoded.accountType === "admin" &&
      decoded.email === ADMIN_EMAIL
    ) {
      return NextResponse.json({
        success: true,
        user: {
          id: decoded.id || "admin-fixed",
          fullName: "Super Admin",
          email: ADMIN_EMAIL,
          accountType: "admin",
        },
      });
    }

    const userId = decoded.id || decoded._id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid token payload" },
        { status: 401 }
      );
    }

    // ✅ Otherwise find user in DB
    const user = await User.findById(userId).populate({
      path: "additionalDetails",
      options: { strictPopulate: false }
    });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("Verify Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
