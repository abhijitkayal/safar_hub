import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import Transaction from "@/models/Transaction";
import { auth } from "@/lib/middlewares/auth";

type TransactionRouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = auth(async (req: NextRequest, context?: TransactionRouteContext) => {
  try {
    await dbConnect();
    const user = (req as any).user;
    
    if (user.accountType !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { id } = (context?.params ? await context.params : { id: undefined });
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid transaction ID" }, { status: 400 });
    }

    const body = await req.json();
    const { status, notes } = body;

    const updates: Record<string, any> = {};

    if (status) {
      if (!["pending", "processing", "completed", "cancelled"].includes(status)) {
        return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
      }
      updates.status = status;
      if (status === "completed") {
        updates.completedAt = new Date();
      }
    }

    if (notes !== undefined) {
      updates.notes = String(notes);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, message: "No updates provided" }, { status: 400 });
    }

    const updated = await Transaction.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).populate("vendorId", "fullName email");

    if (!updated) {
      return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, transaction: updated });
  } catch (error: any) {
    console.error("Transaction update error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update transaction" },
      { status: 500 }
    );
  }
});

