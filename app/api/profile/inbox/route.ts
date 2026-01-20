import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import Support from "@/models/Support";

export const GET = auth(async (req: NextRequest, context: any) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;

    const inboxMessages = await Support.find({
      userId,
      status: { $in: ["replied", "closed"] },
      adminReply: { $exists: true, $ne: null },
    })
      .sort({ repliedAt: -1, createdAt: -1 })
      .populate("repliedBy", "fullName email")
      .lean();

    return NextResponse.json({ success: true, inbox: inboxMessages });
  } catch (error: any) {
    console.error("Inbox fetch error", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch inbox" },
      { status: 500 }
    );
  }
});

