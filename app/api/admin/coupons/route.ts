
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Coupon from "@/models/Coupon";
import { auth } from "@/lib/middlewares/auth";

// GET - List all coupons
export const GET = auth(async (req: NextRequest) => {
      try {
            await dbConnect();
            const user = (req as any).user;

            if (user.accountType !== "admin") {
                  return NextResponse.json(
                        { success: false, message: "Unauthorized" },
                        { status: 403 }
                  );
            }

            const coupons = await Coupon.find({}).sort({ createdAt: -1 });
            return NextResponse.json({ success: true, coupons });
      } catch (error: any) {
            return NextResponse.json(
                  { success: false, message: error.message || "Failed to fetch coupons" },
                  { status: 500 }
            );
      }
});

// POST - Create a new coupon
export const POST = auth(async (req: NextRequest) => {
      try {
            await dbConnect();
            const user = (req as any).user;

            if (user.accountType !== "admin") {
                  return NextResponse.json(
                        { success: false, message: "Unauthorized" },
                        { status: 403 }
                  );
            }

            const body = await req.json();
            const {
                  code,
                  discountType,
                  discountAmount,
                  minPurchase,
                  maxDiscount,
                  startDate,
                  expiryDate,
                  usageLimit,
            } = body;

            if (!code || !discountType || !discountAmount || !expiryDate) {
                  return NextResponse.json(
                        { success: false, message: "Missing required fields" },
                        { status: 400 }
                  );
            }

            // Check if coupon already exists
            const existing = await Coupon.findOne({ code: code.toUpperCase() });
            if (existing) {
                  return NextResponse.json(
                        { success: false, message: "Coupon code already exists" },
                        { status: 400 }
                  );
            }

            const coupon = await Coupon.create({
                  code: code.toUpperCase(),
                  discountType,
                  discountAmount,
                  minPurchase,
                  maxDiscount,
                  startDate: startDate || undefined,
                  expiryDate,
                  usageLimit: usageLimit || undefined,
            });

            return NextResponse.json(
                  { success: true, coupon },
                  { status: 201 }
            );
      } catch (error: any) {
            return NextResponse.json(
                  { success: false, message: error.message || "Failed to create coupon" },
                  { status: 500 }
            );
      }
});
