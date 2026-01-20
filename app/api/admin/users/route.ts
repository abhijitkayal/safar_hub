//app/api/users/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import User from "@/models/User";

export async function GET() {
  await dbConnect();
  const users = await User.find({ accountType: "user" }).select(
    "fullName email contactNumber age createdAt"
  );
  return NextResponse.json({ success: true, users });
}
