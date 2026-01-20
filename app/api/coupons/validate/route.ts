
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Coupon from "@/models/Coupon";
import { auth } from "@/lib/middlewares/auth";

export const POST = auth(async (req: NextRequest) => {
      try {
            const { code, subtotal } = await req.json();

            if (!code) {
                  return NextResponse.json(
                        { success: false, message: "Coupon code is required" },
                        { status: 400 }
                  );
            }

            await dbConnect();

            const coupon = await Coupon.findOne({
                  code: code.toUpperCase(),
                  isActive: true,
            });

            if (!coupon) {
                  return NextResponse.json(
                        { success: false, message: "Invalid or inactive coupon code" },
                        { status: 404 }
                  );
            }

            const now = new Date();
            if (coupon.startDate > now) {
                  return NextResponse.json(
                        { success: false, message: "Coupon is not yet valid" },
                        { status: 400 }
                  );
            }

            if (coupon.expiryDate < now) {
                  return NextResponse.json(
                        { success: false, message: "Coupon has expired" },
                        { status: 400 }
                  );
            }

            if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
                  return NextResponse.json(
                        { success: false, message: "Coupon usage limit reached" },
                        { status: 400 }
                  );
            }

            if (subtotal < coupon.minPurchase) {
                  return NextResponse.json(
                        {
                              success: false,
                              message: `Minimum purchase of ₹${coupon.minPurchase} required for this coupon`,
                        },
                        { status: 400 }
                  );
            }

            let discountAmount = 0;
            if (coupon.discountType === "percentage") {
                  discountAmount = (subtotal * coupon.discountAmount) / 100;
                  if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                        discountAmount = coupon.maxDiscount;
                  }
            } else {
                  discountAmount = coupon.discountAmount;
            }

            return NextResponse.json({
                  success: true,
                  coupon: {
                        _id: coupon._id,
                        code: coupon.code,
                        discountType: coupon.discountType,
                        discountAmount: coupon.discountAmount,
                        minPurchase: coupon.minPurchase,
                        appliedDiscount: discountAmount,
                  },
            });
      } catch (error: any) {
            console.error("Coupon validation error:", error);
            return NextResponse.json(
                  { success: false, message: error.message || "Internal server error" },
                  { status: 500 }
            );
      }
});
