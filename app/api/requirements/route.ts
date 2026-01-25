import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import UserRequirement from "@/models/Userrequirement";
import { auth } from "@/lib/middlewares/auth";

export async function GET() {
  try {
    await dbConnect();

    const requirements = await UserRequirement.find().sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      requirements,
    });
  } catch (error) {
    console.error("GET /requirements ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export const POST = auth(async (req: Request) => {
  try {
    await dbConnect();

    const user = (req as any).user;
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, categories, description } = body;

    if (!title || !categories?.length) {
      return NextResponse.json(
        { success: false, message: "Title and at least one category are required" },
        { status: 400 }
      );
    }

    const requirement = await UserRequirement.create({
      user: user.id,
      title,
      categories,
      description: description || "",
    });

    return NextResponse.json({
      success: true,
      requirement,
    });
  } catch (error: any) {
    console.error("POST /requirements ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
});
