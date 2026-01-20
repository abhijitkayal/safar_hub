import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/middlewares/auth";
import { cloudinaryConnect, uploadImageToCloudinary } from "@/lib/utils/imageUploader";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import os from "os";

export const POST = auth(async (req: NextRequest) => {
      try {
            cloudinaryConnect();

            const user = (req as any).user;
            if (!user) {
                  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
            }

            const form = await req.formData();
            const files = form.getAll("files") as File[];
            const folder = `reviews/${user.id}`;

            if (!files || files.length === 0) {
                  return NextResponse.json({ success: false, message: "No files received" }, { status: 400 });
            }

            const uploads: Array<{
                  url: string;
                  publicId: string;
                  resourceType: string;
                  originalName: string;
            }> = [];

            const tempDir = os.tmpdir();

            for (const file of files) {
                  const bytes = await file.arrayBuffer();
                  const buffer = Buffer.from(bytes);
                  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
                  const tempPath = path.join(tempDir, filename);

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
                        await unlink(tempPath).catch(() => { });
                  }
            }

            return NextResponse.json({ success: true, uploads });
      } catch (error: any) {
            console.error("Upload error:", error);
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }
});
