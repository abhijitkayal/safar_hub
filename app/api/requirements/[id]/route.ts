import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import UserRequirement from "@/models/Userrequirement";
import { auth } from "@/lib/middlewares/auth";

export const PUT = auth(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;

    const updated = await UserRequirement.findOneAndUpdate(
      { _id: params.id, user: userId },
      { status: "closed" },
      { new: true }
    );

    return NextResponse.json({ success: true, updated });
  } catch {
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 500 }
    );
  }
});
