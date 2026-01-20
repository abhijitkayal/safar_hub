import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Blog from "@/models/Blog";

// GET - Get a single blog by slug (public)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();

    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Blog slug is required" },
        { status: 400 }
      );
    }

    const blog = await Blog.findOne({ slug, published: true });

    if (!blog) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, blog });
  } catch (error: any) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch blog" },
      { status: 500 }
    );
  }
}
