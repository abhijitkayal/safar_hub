// app/api/vendor/tours/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Tour from "@/models/Tour";
import { auth } from "@/lib/middlewares/auth";
import mongoose from "mongoose";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const normalizeTourPayload = (body: any) => {
  const {
    name,
    category,
    location,
    heroHighlights = [],
    curatedHighlights = [],
    images,
    gallery = [],
    videos = {},
    popularFacilities = [],
    amenities = {},
    tags = [],
    options,
    about,
    vendorMessage = "",
    defaultCancellationPolicy = "",
    defaultHouseRules = [],
    itinerary = [],
    inclusions = "",
    exclusions = "",
    policyTerms = "",
  } = body;

  if (!name || !category || !location || !Array.isArray(images) || images.length < 5) {
    return { error: "Missing required fields or insufficient images" };
  }

  if (!["group-tours", "tour-packages"].includes(category)) {
    return { error: "Invalid category" };
  }

  if (!Array.isArray(options) || options.length === 0) {
    return { error: "Please add at least one tour option" };
  }

  for (const option of options) {
    const availabilityValue = option?.available ?? option?.inventory ?? 1;
    if (
      !option?.name ||
      !option?.duration ||
      typeof option?.capacity !== "number" ||
      typeof option?.price !== "number" ||
      !Number.isFinite(Number(availabilityValue)) ||
      !Array.isArray(option?.images) ||
      option.images.length < 3
    ) {
      return {
        error:
          "Every tour option must include name, duration, capacity, price, availability and at least 3 images",
      };
    }
  }

  const normalizedOptions = options.map((option: any) => ({
    name: option.name,
    description: option.description ?? "",
    duration: option.duration,
    capacity: Number(option.capacity),
    price: Number(option.price),
    taxes: option.taxes != null ? Number(option.taxes) : 0,
    currency: typeof option.currency === "string" && option.currency.trim().length ? option.currency : "INR",
    features: Array.isArray(option.features) ? option.features : [],
    amenities: Array.isArray(option.amenities) ? option.amenities : [],
    available: Number(option.available ?? option.inventory ?? 1),
    isRefundable: option.isRefundable !== undefined ? Boolean(option.isRefundable) : true,
    refundableUntilHours:
      option.refundableUntilHours !== undefined ? Number(option.refundableUntilHours) : 48,
    images: option.images,
  }));

  const normalizedVideos = {
    inside: Array.isArray(videos?.inside) ? videos.inside : [],
    outside: Array.isArray(videos?.outside) ? videos.outside : [],
  };

  const normalizedAmenities: Record<string, string[]> = {};
  if (amenities && typeof amenities === "object") {
    Object.entries(amenities).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length) {
        normalizedAmenities[key] = value;
      }
    });
  }

  const normalizedTags = Array.isArray(tags)
    ? tags
        .filter((tag: any) => typeof tag === "string" && tag.trim().length)
        .map((tag: string) => tag.trim())
    : [];

  const normalizedCuratedHighlights = Array.isArray(curatedHighlights)
    ? curatedHighlights
        .filter((item: any) => item && typeof item.title === "string" && item.title.trim().length)
        .map((item: any) => ({
          title: item.title.trim(),
          description:
            typeof item.description === "string" && item.description.trim().length
              ? item.description.trim()
              : undefined,
          icon:
            typeof item.icon === "string" && item.icon.trim().length
              ? item.icon.trim()
              : undefined,
        }))
    : [];

  const normalizedItinerary = Array.isArray(itinerary)
    ? itinerary
        .map((item: any, index: number) => {
          const heading =
            typeof item?.heading === "string" && item.heading.trim().length ? item.heading.trim() : `Day ${index + 1}`;
          const description =
            typeof item?.description === "string" ? item.description.trim() : "";
          return heading && description ? { heading, description } : null;
        })
        .filter((item: any) => item !== null)
    : [];

  const normalizeRichText = (value: any) => (typeof value === "string" ? value.trim() : "");

  return {
    payload: {
      name,
      category,
      location,
      heroHighlights,
      images,
      gallery,
      curatedHighlights: normalizedCuratedHighlights,
      tags: normalizedTags,
      videos: normalizedVideos,
      popularFacilities,
      amenities: normalizedAmenities,
      options: normalizedOptions,
      about,
      vendorMessage,
      defaultCancellationPolicy,
      defaultHouseRules,
      itinerary: normalizedItinerary,
      inclusions: normalizeRichText(inclusions),
      exclusions: normalizeRichText(exclusions),
      policyTerms: normalizeRichText(policyTerms),
    },
  };
};
// GET - Fetch tours (vendor-specific or all for admin)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const all = searchParams.get("all") === "true"; // For admin/public to see all

    // Decode to know role
    let accountType: string | null = null;
    try {
      const token = req.cookies.get("token")?.value;
      if (token && process.env.JWT_SECRET) {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
        accountType = decoded?.accountType || null;
      }
    } catch {}

    // Enforce lock for vendor self-requests
    if (vendorId && !all) {
      try {
        const token = req.cookies.get("token")?.value;
        if (token && process.env.JWT_SECRET) {
          const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
          if (decoded?.accountType === "vendor" && (decoded?.id === vendorId || decoded?._id === vendorId)) {
            const vendorUser = await User.findById(vendorId).select("isVendorLocked");
            if (vendorUser?.isVendorLocked) {
              return NextResponse.json(
                { success: false, message: "Vendor account is locked" },
                { status: 403 }
              );
            }
          }
        }
      } catch {}
    }

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Valid tour ID is required" },
          { status: 400 }
        );
      }

      const tour = await Tour.findById(id)
        .populate("vendorId", "fullName email contactNumber")
        .lean();

      if (!tour) {
        return NextResponse.json(
          { success: false, message: "Tour not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, tour });
    }

    let query: any = {};

    // If vendorId provided, always filter by vendor (admin/public or self)
    if (vendorId) {
      if (mongoose.Types.ObjectId.isValid(vendorId)) {
        query.vendorId = new mongoose.Types.ObjectId(vendorId);
      } else {
        query.vendorId = vendorId;
      }
    }

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // If not admin viewing all, only show active tours
    if (!all) {
      query.isActive = true;
    }

    // Public all=true without a specific vendor: exclude locked or unapproved vendors unless admin
    if (all && accountType !== "admin" && !vendorId) {
      const allowedVendors = await User.find({ accountType: "vendor", isVendorApproved: true, isVendorLocked: false }).select("_id");
      const allowedIds = allowedVendors.map((v) => v._id);
      query.vendorId = { $in: allowedIds };
    }

    const tours = await Tour.find(query)
      .populate("vendorId", "fullName email contactNumber")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, tours });
  } catch (error: any) {
    console.error("Error fetching tours:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch tours" },
      { status: 500 }
    );
  }
}

// POST - Create a new tour
export const POST = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const body = await req.json();
    const user = (req as any).user;

    // Verify vendor
    if (user.accountType !== "vendor") {
      return NextResponse.json(
        { success: false, message: "Only vendors can create tours" },
        { status: 403 }
      );
    }

    const vendorId = user.id;

    const { payload, error } = normalizeTourPayload(body);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status: 400 });
    }

    const tour = await Tour.create({
      vendorId,
      ...payload,
      isActive: true,
    });

    const populatedTour = await Tour.findById(tour._id).populate(
      "vendorId",
      "fullName email contactNumber"
    );

    return NextResponse.json(
      { success: true, tour: populatedTour },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating tour:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create tour" },
      { status: 500 }
    );
  }
});

// PUT - Update existing tour
export const PUT = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const body = await req.json();
    const user = (req as any).user;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Valid tour ID is required" },
        { status: 400 }
      );
    }

    const tour = await Tour.findById(id);
    if (!tour) {
      return NextResponse.json(
        { success: false, message: "Tour not found" },
        { status: 404 }
      );
    }

    if (user.accountType !== "admin" && tour.vendorId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to update this tour" },
        { status: 403 }
      );
    }

    const { payload, error } = normalizeTourPayload(body);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status: 400 });
    }

    Object.assign(tour, payload);
    await tour.save();

    const updatedTour = await Tour.findById(id).populate("vendorId", "fullName email contactNumber");

    return NextResponse.json({ success: true, tour: updatedTour });
  } catch (error: any) {
    console.error("Error updating tour:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update tour" },
      { status: 500 }
    );
  }
});

// DELETE - Delete a tour by ID
export const DELETE = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const user = (req as any).user;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Valid tour ID is required" },
        { status: 400 }
      );
    }

    const tour = await Tour.findById(id);
    if (!tour) {
      return NextResponse.json(
        { success: false, message: "Tour not found" },
        { status: 404 }
      );
    }

    // Only vendor who owns it or admin can delete
    if (user.accountType !== "admin" && tour.vendorId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete this tour" },
        { status: 403 }
      );
    }

    await Tour.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Tour deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting tour:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete tour" },
      { status: 500 }
    );
  }
});