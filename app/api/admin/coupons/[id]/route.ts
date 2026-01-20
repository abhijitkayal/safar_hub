
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Coupon from "@/models/Coupon";
import { auth } from "@/lib/middlewares/auth";

type Context = {
      params: Promise<{ id: string }>;
};


// PATCH - Update coupon status or details
export const PATCH = auth(async (req: NextRequest, { params }: Context) => {
      try {
            await dbConnect();
            const user = (req as any).user;
            const { id } = await params;

            if (user.accountType !== "admin") {
                  return NextResponse.json(
                        { success: false, message: "Unauthorized" },
                        { status: 403 }
                  );
            }

            const body = await req.json();
            const coupon = await Coupon.findByIdAndUpdate(id, body, { new: true });

            if (!coupon) {
                  return NextResponse.json(
                        { success: false, message: "Coupon not found" },
                        { status: 404 }
                  );
            }

            return NextResponse.json({ success: true, coupon });
      } catch (error: any) {
            return NextResponse.json(
                  { success: false, message: error.message || "Failed to update coupon" },
                  { status: 500 }
            );
      }
});

// DELETE - Delete a coupon
export const DELETE = auth(async (req: NextRequest, { params }: Context) => {
      try {
            await dbConnect();
            const user = (req as any).user;
            const { id } = await params;

            if (user.accountType !== "admin") {
                  return NextResponse.json(
                        { success: false, message: "Unauthorized" },
                        { status: 403 }
                  );
            }

            const coupon = await Coupon.findByIdAndDelete(id);

            if (!coupon) {
                  return NextResponse.json(
                        { success: false, message: "Coupon not found" },
                        { status: 404 }
                  );
            }

            return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
      } catch (error: any) {
            return NextResponse.json(
                  { success: false, message: error.message || "Failed to delete coupon" },
                  { status: 500 }
            );
      }
});
