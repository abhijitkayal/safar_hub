import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/middlewares/auth";
import { cloudinaryConnect, uploadImageToCloudinary } from "@/lib/utils/imageUploader";
import { writeFile, unlink } from "fs/promises";
import path from "path";

export const POST = auth(async (req: NextRequest) => {
  cloudinaryConnect();

  const user = (req as any).user;
  // Allow both admin and vendor sellers to upload product images
  if (!user || (user.accountType !== "admin" && !(user.accountType === "vendor" && user.isSeller))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  const form = await req.formData();
  const files = form.getAll("files") as File[];
  // Update folder path to include vendor ID for vendors
  const baseFolder = user.accountType === "admin" ? "products/admin" : `products/vendor/${user.id || user._id}`;
  const folder = form.get("folder")?.toString() ?? baseFolder;

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