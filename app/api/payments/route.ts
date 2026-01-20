import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import Settlement from "@/models/Settlement";
import { auth } from "@/lib/middlewares/auth";

export const GET = auth(async (req: NextRequest, context: any) => {
  try {
    await dbConnect();
    const user = (req as any).user;
    const { searchParams } = new URL(req.url);

    const query: any = {};
    const status = searchParams.get("status");
    const vendorId = searchParams.get("vendorId");

    if (status) query.status = status;

    if (user.accountType === "admin") {
      if (vendorId) {
        if (!mongoose.Types.ObjectId.isValid(vendorId)) {
          return NextResponse.json({ success: false, message: "Invalid vendor id" }, { status: 400 });
        }
        query.vendorId = vendorId;
      }
    } else if (user.accountType === "vendor") {
      query.vendorId = user.id;
    } else {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const settlements = await Settlement.find(query)
      .populate("bookingId", "checkIn checkOut totalAmount status")
      .populate("stayId", "name category")
      .sort({ scheduledDate: 1 })
      .lean();

    return NextResponse.json({ success: true, settlements });
  } catch (error: any) {
    console.error("Settlement fetch error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch settlements" },
      { status: 500 }
    );
  }
});

export const PATCH = auth(async (req: NextRequest, context: any) => {
  try {
    await dbConnect();
    const user = (req as any).user;

    if (user.accountType !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { settlementId, status, amountPaid, notes } = body;

    if (!settlementId || !mongoose.Types.ObjectId.isValid(settlementId)) {
      return NextResponse.json({ success: false, message: "Invalid settlement id" }, { status: 400 });
    }

    const updates: Record<string, any> = {};

    if (status) {
      if (!["pending", "processing", "paid", "cancelled"].includes(status)) {
        return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
      }
      updates.status = status;
      if (status === "paid") updates.paidAt = new Date();
    }

    if (amountPaid !== undefined) updates.amountPaid = Number(amountPaid);
    if (notes !== undefined) updates.notes = String(notes);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, message: "No updates provided" }, { status: 400 });
    }

    const updated = await Settlement.findByIdAndUpdate(
      settlementId,
      { $set: updates },
      { new: true }
    );

    return NextResponse.json({ success: true, settlement: updated });
  } catch (error: any) {
    console.error("Settlement update error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update settlement" },
      { status: 500 }
    );
  }
});
