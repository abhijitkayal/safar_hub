import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Tour from "@/models/Tour";
import User from "@/models/User";

const ALLOWED_CATEGORIES = new Set(["group-tours", "tour-packages"]);

const escapeRegex = (input: string) =>
  input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const city = searchParams.get("city") || undefined;
    const guestsParam = searchParams.get("guests");
    const guests = guestsParam ? Number(guestsParam) : undefined;

    const vendorIds = await User.find({
      accountType: "vendor",
      isVendorApproved: true,
      isVendorLocked: false,
    })
      .select("_id")
      .lean();

    const query: Record<string, unknown> = {
      isActive: true,
      vendorId: { $in: vendorIds.map((v) => v._id) },
    };

    if (category && ALLOWED_CATEGORIES.has(category)) {
      query.category = category;
    }

    if (city) {
      query["location.city"] = {
        $regex: new RegExp(escapeRegex(city.trim()), "i"),
      };
    }

    const tours = await Tour.find(query).sort({ createdAt: -1 }).lean();

    const filteredTours = Array.isArray(tours)
      ? tours.filter((tour) => {
          if (guests && Number.isFinite(guests) && guests > 0) {
            const hasCapacity =
              tour.options?.some(
                (option: { capacity?: number }) =>
                  typeof option?.capacity === "number" &&
                  option.capacity >= guests
              ) ?? false;
            if (!hasCapacity) return false;
          }
          return true;
        })
      : [];

    return NextResponse.json({ success: true, tours: filteredTours });
  } catch (error) {
    console.error("Public tours fetch failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load tours" },
      { status: 500 }
    );
  }
}

