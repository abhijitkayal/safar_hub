//app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import User from "@/models/User";
import Profile from "@/models/Profile";

export const GET = auth(async (req: NextRequest) => {
  await dbConnect();
  const userId = (req as any).user.id;
  const user = await User.findById(userId)
    .select("-password")
    .populate("additionalDetails")
    .lean();
  if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  return NextResponse.json({ success: true, user });
});

export const PUT = auth(async (req: NextRequest) => {
  await dbConnect();
  const userId = (req as any).user.id;
  const body = await req.json();

  const user = await User.findById(userId).populate("additionalDetails");
  if (!user)
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );

  // ✅ Extract additionalDetails from body
  const profileData = body.additionalDetails;
  delete body.additionalDetails;

  // ✅ Update USER fields (name, phone, etc.)
  Object.assign(user, body);

  // ✅ Update or create PROFILE
  if (profileData) {
    if (user.additionalDetails) {
      // ✅ Update existing profile
      await Profile.findByIdAndUpdate(
        user.additionalDetails._id,
        profileData,
        { new: true }
      );
    } else {
      // ✅ Create new profile & attach to user
      const newProfile = await Profile.create(profileData);
      user.additionalDetails = newProfile._id;
    }
  }

  await user.save();

  return NextResponse.json({
    success: true,
    message: "Profile updated",
  });
});


export const DELETE = auth(async (req: NextRequest) => {
  await dbConnect();
  const userId = (req as any).user.id;
  const user = await User.findById(userId).populate("additionalDetails");
  if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  if (user.additionalDetails) await Profile.findByIdAndDelete((user.additionalDetails as any)._id);
  await User.findByIdAndDelete(userId);
  const res = NextResponse.json({ success: true, message: "Account deleted" });
  res.cookies.delete("token");
  return res;
});