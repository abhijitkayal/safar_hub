// app/api/vehicle-rentals/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import VehicleRental from "@/models/VehicleRental";
import mongoose from "mongoose";
import User from "@/models/User";

// GET - Fetch vehicle rentals (public access)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    let query: any = {};

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // Only show active rentals and from unlocked + approved vendors for public
    query.isActive = true;

    // Constrain vendors to approved and unlocked
    const allowedVendors = await User.find({ accountType: "vendor", isVendorApproved: true, isVendorLocked: false }).select("_id");
    const allowedIds = allowedVendors.map((v) => v._id);
    query.vendorId = { $in: allowedIds };

    const rentals = await VehicleRental.find(query)
      .populate("vendorId", "fullName email contactNumber")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, rentals });
  } catch (error: any) {
    console.error("Error fetching vehicle rentals:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch vehicle rentals" },
      { status: 500 }
    );
  }
}

