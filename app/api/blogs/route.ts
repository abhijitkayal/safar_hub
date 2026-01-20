import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Blog from "@/models/Blog";

// GET - Get all published blogs (public)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const blogs = await Blog.find({ published: true })
      .sort({ createdAt: -1 })
      .select("title image slug published createdAt");

    return NextResponse.json({ success: true, blogs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

