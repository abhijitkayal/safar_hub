// app/api/addresses/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import UserAddress from "@/models/UserAddress";

export const GET = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;

    const addresses = await UserAddress.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error: any) {
    console.error("Addresses GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
});

export const POST = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const user = (req as any).user;
    const userId = user.id || user._id;

    if (!userId || userId === "admin-fixed") {
      return NextResponse.json(
        { success: false, message: "Authentication error: Valid User ID required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, phone, pincode, address, city, state, landmark } = body;

    if (!name || !phone || !pincode || !address || !city || !state) {
      return NextResponse.json(
        { success: false, message: "All required fields must be provided" },
        { status: 400 }
      );
    }

    const newAddress = await UserAddress.create({
      user: userId,
      name,
      phone,
      pincode,
      address,
      city,
      state,
      landmark,
    });

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error: any) {
    console.error("Address POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add address" },
      { status: 500 }
    );
  }
});

