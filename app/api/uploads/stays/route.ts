import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/middlewares/auth";
import { cloudinaryConnect, uploadImageToCloudinary } from "@/lib/utils/imageUploader";
import { writeFile, unlink } from "fs/promises";
import path from "path";

export const POST = auth(async (req: NextRequest) => {
  cloudinaryConnect();

  const user = (req as any).user;
  if (!user || !["vendor", "admin"].includes(user.accountType)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  const form = await req.formData();
  const files = form.getAll("files") as File[];
  const folder =
    form.get("folder")?.toString() ??
    `stays/${user.accountType === "vendor" ? user.id : "admin"}`;

  if (!files.length) {
    return NextResponse.json({ success: false, message: "No files received" }, { status: 400 });
  }

  const uploads: Array<{
    url: string;
    publicId: string;
    resourceType: string;
    originalName: string;
  }> = [];

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const tempPath = path.join("/tmp", filename);

    try {
      await writeFile(tempPath, buffer);
      const result = await uploadImageToCloudinary({ tempFilePath: tempPath }, folder);
      uploads.push({
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        originalName: file.name,
      });
    } finally {
      await unlink(tempPath).catch(() => {});
    }
  }

  return NextResponse.json({ success: true, uploads });
});


