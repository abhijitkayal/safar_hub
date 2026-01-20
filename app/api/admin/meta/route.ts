import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import AdminMeta from "@/models/AdminMeta";

type AdminMetaRouteContext = {
  params: Promise<Record<string, never>>;
};

export const GET = auth(async (req: NextRequest, _context: AdminMetaRouteContext) => {
  try {
    await dbConnect();
    const { email, accountType } = (req as any).user || {};

    // Only admin can access
    if (accountType !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    if (!ADMIN_EMAIL || email !== ADMIN_EMAIL) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const meta = await AdminMeta.findOne({ email: ADMIN_EMAIL }).lean();
    return NextResponse.json({
      success: true,
      meta: meta ?? { email: ADMIN_EMAIL, loginCount: 0, lastLogin: null },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
});


