import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Stay from "@/models/Stay";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const guestsParam = searchParams.get("guests");
    const guests = guestsParam ? parseInt(guestsParam) : undefined;

    const query: any = { isActive: true };

    if (category && category !== "all") {
      query.category = category;
    }

    if (city) {
      query["location.city"] = { $regex: city, $options: "i" };
    }

    if (typeof guests === "number" && !Number.isNaN(guests) && guests > 0) {
      if (query.category === "bnbs") {
        query["bnb.capacity"] = { $gte: guests };
      } else if (query.category && query.category !== "bnbs") {
        query.rooms = { $elemMatch: { capacity: { $gte: guests } } };
      } else {
        query.$or = [
          { category: "bnbs", "bnb.capacity": { $gte: guests } },
          {
            category: { $ne: "bnbs" },
            rooms: { $elemMatch: { capacity: { $gte: guests } } },
          },
        ];
      }
    }

    const allowedVendors = await User.find({ accountType: "vendor", isVendorApproved: true, isVendorLocked: false }).select("_id");
    const allowedIds = allowedVendors.map((v) => v._id);
    query.vendorId = { $in: allowedIds };

    const stays = await Stay.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, stays });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch stays" },
      { status: 500 }
    );
  }
}