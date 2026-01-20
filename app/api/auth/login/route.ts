import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/config/database";
import User from "@/models/User";
import AdminMeta from "@/models/AdminMeta";
import "@/models/Profile";

export async function POST(req: NextRequest) {
  try {
    // Ensure database connection with better error handling
    try {
      await dbConnect();
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { success: false, message: "Database connection failed" },
        { status: 500 }
      );
    }

    const { email, password } = await req.json();


    const JWT_SECRET = process.env.JWT_SECRET!;

    // ✅ 1. Admin Login using .env credentials (NO HARDCODE)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("Admin credentials missing in .env");
    }

    // ✅ Check for ADMIN login first (bypass DB)
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Try to find if an admin user exists in DB to get a real ID, else use a placeholder valid ObjectId
      const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
      const adminId = existingAdmin?._id || "507f1f77bcf86cd799439011";

      const token = jwt.sign(
        { id: adminId, email: ADMIN_EMAIL, accountType: "admin" },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" }
      );

      // ✅ Upsert admin login metrics
      try {
        await AdminMeta.updateOne(
          { email: ADMIN_EMAIL },
          { $inc: { loginCount: 1 }, $set: { lastLogin: new Date() } },
          { upsert: true }
        );
      } catch (e) {
        console.error("Failed to update admin meta:", e);
      }

      const response = NextResponse.json({
        success: true,
        message: "Admin login successful",
        user: {
          id: "admin-fixed",
          fullName: "Super Admin",
          email: ADMIN_EMAIL,
          accountType: "admin",
        },
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60, // 1 day
        secure: process.env.NODE_ENV === "production",
      });

      return response;
    }

    // ✅ 2. USER / VENDOR LOGIN (from MongoDB)
    // Add timeout handling for the database query
    let user;
    try {
      user = await User.findOne({ email }).populate("additionalDetails").maxTimeMS(10000); // 10 second timeout
    } catch (dbQueryError) {
      console.error("Database query error:", dbQueryError);
      return NextResponse.json(
        { success: false, message: "Database query timeout" },
        { status: 500 }
      );
    }

    if (!user)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        accountType: user.accountType,
        isSeller: user.isSeller ?? false,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const res = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        accountType: user.accountType,
        isVendorSetupComplete: user.isVendorSetupComplete,
        vendorServices: user.vendorServices || [],
        isVendorApproved: user.isVendorApproved ?? false,
        isVendorLocked: user.isVendorLocked ?? false,
        isSeller: user.isSeller ?? false,
      },
    });

    // ✅ Dev-safe cookie (works in localhost and production)
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite:
        process.env.NODE_ENV === "production" ? "strict" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}