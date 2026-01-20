import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import Transaction from "@/models/Transaction";
import { auth } from "@/lib/middlewares/auth";

type AdminTransactionContext = {
  params: Promise<Record<string, never>>;
};

// POST - Create transaction
export const POST = auth(async (req: NextRequest, _context?: AdminTransactionContext) => {
  console.log("POST /api/admin/transactions called");
  try {
    await dbConnect();
    const user = (req as any).user;

    if (user.accountType !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { vendorId, message, amount, currency, scheduledDate, notes } = body;

    if (!vendorId || !mongoose.Types.ObjectId.isValid(vendorId)) {
      return NextResponse.json({ success: false, message: "Invalid vendor ID" }, { status: 400 });
    }

    if (!message?.trim()) {
      return NextResponse.json({ success: false, message: "Message is required" }, { status: 400 });
    }

    if (!scheduledDate) {
      return NextResponse.json({ success: false, message: "Scheduled date is required" }, { status: 400 });
    }

    const transaction = new Transaction({
      vendorId,
      message: message.trim(),
      amount: amount ? Number(amount) : undefined,
      currency: currency || "INR",
      scheduledDate: new Date(scheduledDate),
      notes: notes?.trim(),
      status: "pending",
    });

    await transaction.save();

    return NextResponse.json({
      success: true,
      transaction,
      message: "Transaction created successfully",
    });
  } catch (error: any) {
    console.error("Transaction creation error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create transaction" },
      { status: 500 }
    );
  }
});

// GET - Admin/vendor fetch transactions
export const GET = auth(async (req: NextRequest, _context?: AdminTransactionContext) => {
  console.log("GET /api/admin/transactions called");
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

    const transactions = await Transaction.find(query)
      .populate("vendorId", "fullName email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, transactions });
  } catch (error: any) {
    console.error("Transaction fetch error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
});
