// app/api/addresses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import UserAddress from "@/models/UserAddress";

export const DELETE = auth(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;
    const { id } = await params;
    const addressId = id;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return NextResponse.json(
        { success: false, message: "Invalid address ID" },
        { status: 400 }
      );
    }

    const address = await UserAddress.findOne({
      _id: addressId,
      user: userId,
    });

    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    await UserAddress.deleteOne({ _id: addressId });

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error: any) {
    console.error("Address DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete address" },
      { status: 500 }
    );
  }
});

export const PATCH = auth(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;
    const { id } = await params;
    const addressId = id;
    const body = await req.json();

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return NextResponse.json(
        { success: false, message: "Invalid address ID" },
        { status: 400 }
      );
    }

    const address = await UserAddress.findOne({
      _id: addressId,
      user: userId,
    });

    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    const { name, phone, pincode, address: addressLine, city, state, landmark } = body;

    if (name) address.name = name;
    if (phone) address.phone = phone;
    if (pincode) address.pincode = pincode;
    if (addressLine) address.address = addressLine;
    if (city) address.city = city;
    if (state) address.state = state;
    if (landmark !== undefined) address.landmark = landmark;

    await address.save();

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error: any) {
    console.error("Address PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update address" },
      { status: 500 }
    );
  }
});

