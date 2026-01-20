import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import Support from "@/models/Support";

// POST - Admin replies to a support message
export const POST = auth(async (req: NextRequest, context?: { params: Promise<{ id: string }> }) => {
  try {
    await dbConnect();
    const user = (req as any).user;

    // Verify admin
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    if (!context?.params) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }

    const { id: messageId } = await context.params;
    const { reply } = await req.json();

    if (!reply || !reply.trim()) {
      return NextResponse.json(
        { success: false, message: "Reply message is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json(
        { success: false, message: "Invalid message ID" },
        { status: 400 }
      );
    }

    const supportMessage = await Support.findByIdAndUpdate(
      messageId,
      {
        adminReply: reply,
        status: "replied",
        repliedAt: new Date(),
        repliedBy: user.id,
      },
      { new: true }
    )
      .populate("userId", "fullName email")
      .populate("repliedBy", "fullName email");

    if (!supportMessage) {
      return NextResponse.json(
        { success: false, message: "Support message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully",
      support: supportMessage,
    });
  } catch (error: any) {
    console.error("Admin reply error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send reply" },
      { status: 500 }
    );
  }
});

// PATCH - Admin can update message status (e.g., close)
export const PATCH = auth(async (req: NextRequest, context?: { params: Promise<{ id: string }> }) => {
  try {
    await dbConnect();
    const user = (req as any).user;

    // Verify admin
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    if (!context?.params) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }

    const { id: messageId } = await context.params;
    const { status } = await req.json();

    if (!status || !["open", "replied", "closed"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Valid status is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json(
        { success: false, message: "Invalid message ID" },
        { status: 400 }
      );
    }

    const supportMessage = await Support.findByIdAndUpdate(
      messageId,
      { status },
      { new: true }
    )
      .populate("userId", "fullName email")
      .populate("repliedBy", "fullName email");

    if (!supportMessage) {
      return NextResponse.json(
        { success: false, message: "Support message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
      support: supportMessage,
    });
  } catch (error: any) {
    console.error("Admin status update error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update status" },
      { status: 500 }
    );
  }
});

