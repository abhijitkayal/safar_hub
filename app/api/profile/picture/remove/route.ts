// app/api/profile/picture/remove/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import User from "@/models/User";

type ProfilePictureRemoveRouteContext = {
  params: Promise<Record<string, never>>;
};

export const PUT = auth(async (req: NextRequest, _context: ProfilePictureRemoveRouteContext) => {
  await dbConnect();
  const userId = (req as any).user.id;

  const updated = await User.findByIdAndUpdate(userId, { avatar: "" }, { new: true })
    .select("-password")
    .populate("additionalDetails")
    .lean();

  return NextResponse.json({ success: true, message: "Image removed", user: updated });
});
