import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import UserRequirement from "@/models/UserRequirement";
import { getUserFromRequest } from "@/lib/auth/getUser";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);

    const updated = await UserRequirement.findOneAndUpdate(
      { _id: params.id, user: user._id },
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
}
