import { NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import UserRequirement from "@/models/Userrequirement";
import { auth } from "@/lib/middlewares/auth";

export const GET = auth(async (req: Request) => {
  try {
    await dbConnect();

    const user = (req as any).user;

    if (!user || user.accountType !== "vendor") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // vendor services like ["home-stays","bnb"]
    const vendorServices: string[] = user.services || [];

    const requirements = await UserRequirement.find({
      categories: { $in: vendorServices },
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, requirements });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
});
