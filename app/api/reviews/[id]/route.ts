import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/middlewares/auth";
import dbConnect from "@/lib/config/database";
import Review from "@/models/Review";
import Product from "@/models/Product";
import Stay from "@/models/Stay";
import Tour from "@/models/Tour";
import Adventure from "@/models/Adventure";
import VehicleRental from "@/models/VehicleRental";
import mongoose from "mongoose";

export const DELETE = auth(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
      try {
            await dbConnect();
            const user = (req as any).user;
            if (!user || user.accountType !== "admin") {
                  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
            }

            const { id } = await params;
            const review = await Review.findById(id);

            if (!review) {
                  return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });
            }

            const { targetId, targetType } = review;

            await Review.findByIdAndDelete(id);

            // Update average rating for the target item after deletion
            const allReviews = await Review.find({ targetId, targetType });
            const averageRating = allReviews.length > 0
                  ? allReviews.reduce((acc, rev) => acc + rev.rating, 0) / allReviews.length
                  : 0;
            const count = allReviews.length;

            let Model: any;
            switch (targetType) {
                  case "Product": Model = Product; break;
                  case "Stay": Model = Stay; break;
                  case "Tour": Model = Tour; break;
                  case "Adventure": Model = Adventure; break;
                  case "VehicleRental": Model = VehicleRental; break;
            }

            if (Model) {
                  await Model.findByIdAndUpdate(targetId, {
                        "rating.average": averageRating,
                        "rating.count": count,
                  });
            }

            return NextResponse.json({ success: true, message: "Review deleted successfully" });
      } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }
});
