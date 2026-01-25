import { NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import UserRequirement from "@/models/Userrequirement";
import { auth } from "@/lib/middlewares/auth";

export const POST = auth(async (req: Request, { params }: any) => {
  try {
    await dbConnect();

    const user = (req as any).user;
    if (!user || user.accountType !== "vendor") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message required" },
        { status: 400 }
      );
    }

    const requirement = await UserRequirement.findById(params.id);
    if (!requirement) {
      return NextResponse.json(
        { success: false, message: "Requirement not found" },
        { status: 404 }
      );
    }

    requirement.comments.push({
      vendor: user.id,
      message,
      createdAt: new Date(),
    });

    await requirement.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
});
