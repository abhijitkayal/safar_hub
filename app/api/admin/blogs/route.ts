import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Blog from "@/models/Blog";
import { auth } from "@/lib/middlewares/auth";
import { cloudinaryConnect, uploadImageToCloudinary } from "@/lib/utils/imageUploader";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import jwt from "jsonwebtoken";

// GET - Get all blogs (public for published, admin for all)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true"; // For admin to see all blogs

    // Check if user is admin
    let isAdmin = false;
    try {
      const authHeader = req.headers.get("authorization");
      const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
      const tokenFromCookie = req.cookies.get("token")?.value;
      const token = tokenFromHeader || tokenFromCookie;

      if (token && process.env.JWT_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
        isAdmin = decoded.accountType === "admin";
      }
    } catch {}

    const query: any = {};
    if (!isAdmin || !all) {
      query.published = true;
    }

    const blogs = await Blog.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, blogs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

type AdminBlogsRouteContext = {
  params: Promise<Record<string, never>>;
};

// POST - Create a new blog (admin only)
export const POST = auth(async (req: NextRequest, _context: AdminBlogsRouteContext) => {
  try {
    await dbConnect();
    const user = (req as any).user;

    // Only admin can create blogs
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only admin can create blogs" },
        { status: 403 }
      );
    }

    cloudinaryConnect();

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const published = formData.get("published") === "true";
    const imageFile = formData.get("image") as File | null;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: "Title and content are required" },
        { status: 400 }
      );
    }

    let imageUrl = "";
    if (imageFile && imageFile.size > 0) {
      try {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
        const tempPath = path.join("/tmp", filename);

        await writeFile(tempPath, buffer);
        const result = await uploadImageToCloudinary({ tempFilePath: tempPath }, "blogs");
        imageUrl = result.secure_url;
        await unlink(tempPath).catch(() => {});
      } catch (uploadError: any) {
        console.error("Image upload error:", uploadError);
        return NextResponse.json(
          { success: false, message: "Failed to upload image: " + uploadError.message },
          { status: 500 }
        );
      }
    }

    // Generate slug
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    // Check if slug exists
    const existing = await Blog.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A blog with this title already exists" },
        { status: 400 }
      );
    }

    const blog = await Blog.create({
      title,
      content,
      image: imageUrl || undefined,
      published,
      slug,
    });

    return NextResponse.json(
      { success: true, blog },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create blog" },
      { status: 500 }
    );
  }
});

