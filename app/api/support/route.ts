import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import Support from "@/models/Support";

// GET - User's support messages
export const GET = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;

    const messages = await Support.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error("Support fetch error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch support messages" },
      { status: 500 }
    );
  }
});

// POST - User sends a support message
export const POST = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;
    const { subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json(
        { success: false, message: "Subject and message are required" },
        { status: 400 }
      );
    }

    const supportMessage = await Support.create({
      userId,
      subject,
      message,
      status: "open",
    });

    return NextResponse.json({
      success: true,
      message: "Support request submitted successfully",
      support: supportMessage,
    });
  } catch (error: any) {
    console.error("Support create error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit support request" },
      { status: 500 }
    );
  }
});

