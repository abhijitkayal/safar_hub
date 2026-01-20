import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/middlewares/auth";
import dbConnect from "@/lib/config/database";
import Review from "@/models/Review";
import Product from "@/models/Product";
import Stay from "@/models/Stay";
import Tour from "@/models/Tour";
import Adventure from "@/models/Adventure";
import VehicleRental from "@/models/VehicleRental";
import Order from "@/models/Order";
import Booking from "@/models/Booking";
import mongoose from "mongoose";

export const GET = async (req: NextRequest) => {
      try {
            await dbConnect();
            const { searchParams } = new URL(req.url);
            const targetId = searchParams.get("targetId");
            const targetType = searchParams.get("targetType");
            const userId = searchParams.get("userId");
            const limit = Math.max(1, parseInt(searchParams.get("limit") || "10"));
            const page = Math.max(1, parseInt(searchParams.get("page") || "1"));

            const query: any = {};
            if (targetId) {
                  if (mongoose.isValidObjectId(targetId)) {
                        query.targetId = new mongoose.Types.ObjectId(targetId);
                  } else {
                        return NextResponse.json({ success: true, reviews: [], total: 0, totalPages: 0, currentPage: page });
                  }
            }

            if (targetType) query.targetType = targetType;

            if (userId) {
                  if (mongoose.isValidObjectId(userId)) {
                        query.userId = new mongoose.Types.ObjectId(userId);
                  } else {
                        return NextResponse.json({ success: true, reviews: [], total: 0, totalPages: 0, currentPage: page });
                  }
            }

            const reviews = await Review.find(query)
                  .populate("userId", "fullName avatar")
                  .sort({ createdAt: -1 })
                  .skip((page - 1) * limit)
                  .limit(limit)
                  .lean();

            const populatedReviews = await Promise.all(
                  reviews.map(async (review) => {
                        let Model: any;
                        switch (review.targetType) {
                              case "Product": Model = Product; break;
                              case "Stay": Model = Stay; break;
                              case "Tour": Model = Tour; break;
                              case "Adventure": Model = Adventure; break;
                              case "VehicleRental": Model = VehicleRental; break;
                        }

                        if (Model) {
                              try {
                                    const target = await Model.findById(review.targetId).select("name images").lean();
                                    return { ...review, target };
                              } catch (e) {
                                    return review;
                              }
                        }
                        return review;
                  })
            );

            const total = await Review.countDocuments(query);

            return NextResponse.json({
                  success: true,
                  reviews: populatedReviews,
                  total,
                  totalPages: Math.ceil(total / limit),
                  currentPage: page,
            });
      } catch (error: any) {
            console.error("GET Reviews error:", error);
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }
};

export const POST = auth(async (req: NextRequest) => {
      try {
            await dbConnect();
            const user = (req as any).user;
            if (!user || (!user.id && !user._id)) {
                  return NextResponse.json({ success: false, message: "Unauthorized - User ID missing" }, { status: 401 });
            }

            const uid = user.id || user._id;
            if (!mongoose.isValidObjectId(uid)) {
                  return NextResponse.json({ success: false, message: "Invalid user ID in token" }, { status: 400 });
            }
            const userObjectId = new mongoose.Types.ObjectId(uid);

            const body = await req.json();
            const { targetId, targetType, rating, message, images } = body;

            if (!targetId || !targetType || !rating || !message) {
                  return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
            }

            if (!mongoose.isValidObjectId(targetId)) {
                  return NextResponse.json({ success: false, message: "Invalid target ID" }, { status: 400 });
            }
            const targetObjectId = new mongoose.Types.ObjectId(targetId);

            // Eligibility check
            if (targetType === "Product") {
                  const order = await Order.findOne({
                        user: userObjectId,
                        "items.itemId": targetObjectId,
                        status: "Delivered",
                  });
                  if (!order) {
                        return NextResponse.json(
                              { success: false, message: "You can only review products that have been delivered to you. Ensure your order is marked as Delivered." },
                              { status: 403 }
                        );
                  }
            } else {
                  const bookingQuery: any = {
                        customerId: userObjectId,
                        status: "completed",
                  };
                  if (targetType === "Stay") bookingQuery.stayId = targetObjectId;
                  else if (targetType === "Tour") bookingQuery.tourId = targetObjectId;
                  else if (targetType === "Adventure") bookingQuery.adventureId = targetObjectId;
                  else if (targetType === "VehicleRental") bookingQuery.vehicleRentalId = targetObjectId;

                  const booking = await Booking.findOne(bookingQuery);
                  if (!booking) {
                        return NextResponse.json(
                              { success: false, message: "You can only review services that you have completed. Ensure your booking status is 'completed'." },
                              { status: 403 }
                        );
                  }
            }

            const existingReview = await Review.findOne({
                  userId: userObjectId,
                  targetId: targetObjectId,
                  targetType,
            });

            if (existingReview) {
                  return NextResponse.json({ success: false, message: "You have already reviewed this item." }, { status: 400 });
            }

            const review = await Review.create({
                  userId: userObjectId,
                  targetId: targetObjectId,
                  targetType,
                  rating,
                  message,
                  images: images || [],
            });

            const allReviews = await Review.find({ targetId: targetObjectId, targetType });
            const averageRating = allReviews.reduce((acc, rev) => acc + rev.rating, 0) / allReviews.length;
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
                  await Model.findByIdAndUpdate(targetObjectId, {
                        "rating.average": averageRating,
                        "rating.count": count,
                  });
            }

            return NextResponse.json({ success: true, review });
      } catch (error: any) {
            console.error("POST Review error:", error);
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }
});
