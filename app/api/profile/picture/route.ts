// app/api/profile/picture/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import User from "@/models/User";
import { cloudinaryConnect, uploadImageToCloudinary } from "@/lib/utils/imageUploader";
import { writeFile, unlink } from "fs/promises";
import path from "path";

export const POST = auth(async (req: NextRequest) => {
  await dbConnect();
  cloudinaryConnect();

  const userId = (req as any).user.id;
  const form = await req.formData();
  const file = form.get("displayPicture") as File | null;

  if (!file) {
    return NextResponse.json({ success: false, message: "No image uploaded" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name}`;
  const tempPath = path.join("/tmp", filename);

  await writeFile(tempPath, buffer);
  const result = await uploadImageToCloudinary({ tempFilePath: tempPath }, "profile_pics");
  await unlink(tempPath).catch(() => {});

  const updated = await User.findByIdAndUpdate(userId, { avatar: result.secure_url }, { new: true })
    .select("-password")
    .populate("additionalDetails")
    .lean();

  return NextResponse.json({ success: true, message: "Picture updated", user: updated });
});
