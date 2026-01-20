import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Blog from "@/models/Blog";
import { auth } from "@/lib/middlewares/auth";
import { cloudinaryConnect, uploadImageToCloudinary } from "@/lib/utils/imageUploader";
import { writeFile, unlink } from "fs/promises";
import path from "path";

// GET - Get a single blog by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const resolvedParams = await params;
    const blogId = resolvedParams.id;

    if (!blogId) {
      return NextResponse.json(
        { success: false, message: "Blog ID is required" },
        { status: 400 }
      );
    }

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, blog });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

// PUT - Update a blog (admin only)
export const PUT = auth(async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await dbConnect();
    const user = (req as any).user;

    // Only admin can update blogs
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only admin can update blogs" },
        { status: 403 }
      );
    }

    if (!context?.params) {
      return NextResponse.json(
        { success: false, message: "Blog ID is required" },
        { status: 400 }
      );
    }

    const resolvedParams = await context.params;
    const blogId = resolvedParams.id;

    if (!blogId) {
      return NextResponse.json(
        { success: false, message: "Blog ID is required" },
        { status: 400 }
      );
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    cloudinaryConnect();

    const formData = await req.formData();
    const title = formData.get("title") as string | null;
    const content = formData.get("content") as string | null;
    const publishedStr = formData.get("published") as string | null;
    const imageFile = formData.get("image") as File | null;

    if (title) {
      blog.title = title;
      // Regenerate slug if title changed
      blog.slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }
    if (content) blog.content = content;
    if (publishedStr !== null) blog.published = publishedStr === "true";

    // Handle image upload if new image provided
    if (imageFile && imageFile.size > 0) {
      try {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
        const tempPath = path.join("/tmp", filename);

        await writeFile(tempPath, buffer);
        const result = await uploadImageToCloudinary({ tempFilePath: tempPath }, "blogs");
        blog.image = result.secure_url;
        await unlink(tempPath).catch(() => { });
      } catch (uploadError: any) {
        console.error("Image upload error:", uploadError);
        return NextResponse.json(
          { success: false, message: "Failed to upload image: " + uploadError.message },
          { status: 500 }
        );
      }
    }

    await blog.save();

    return NextResponse.json({ success: true, blog });
  } catch (error: any) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update blog" },
      { status: 500 }
    );
  }
});

// DELETE - Delete a blog (admin only)
export const DELETE = auth(async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await dbConnect();
    const user = (req as any).user;

    // Only admin can delete blogs
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only admin can delete blogs" },
        { status: 403 }
      );
    }

    if (!context?.params) {
      return NextResponse.json(
        { success: false, message: "Blog ID is required" },
        { status: 400 }
      );
    }

    const resolvedParams = await context.params;
    const blogId = resolvedParams.id;

    if (!blogId) {
      return NextResponse.json(
        { success: false, message: "Blog ID is required" },
        { status: 400 }
      );
    }

    const blog = await Blog.findByIdAndDelete(blogId);

    if (!blog) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Blog deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete blog" },
      { status: 500 }
    );
  }
});
