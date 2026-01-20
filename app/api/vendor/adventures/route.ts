// app/api/vendor/adventures/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Adventure from "@/models/Adventure";
import { auth } from "@/lib/middlewares/auth";
import mongoose from "mongoose";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const normalizeAdventurePayload = (body: any) => {
  const {
    name,
    category,
    duration,
    price,
    capacity,
    difficultyLevel = "",
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
    features = [],
    itinerary = [],
    inclusions = "",
    exclusions = "",
    policyTerms = "",
  } = body;

  if (
    !name ||
    !category ||
    !location ||
    !Array.isArray(images) ||
    images.length < 5 ||
    !duration ||
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    typeof capacity !== "number" ||
    !Number.isFinite(capacity)
  ) {
    return { error: "Missing required fields or insufficient images" };
  }

  if (!["trekking", "hiking", "camping", "water-rafting"].includes(category)) {
    return { error: "Invalid category" };
  }

  const requiresDifficulty = ["trekking", "hiking", "water-rafting"].includes(category);
  if (requiresDifficulty && !difficultyLevel?.trim()) {
    return { error: "Difficulty level is required for the selected category" };
  }

  if (!Array.isArray(options) || options.length === 0) {
    return { error: "Please add at least one adventure option" };
  }

  for (const option of options) {
    const availabilityValue = option?.available ?? option?.inventory ?? 1;
    if (
      !option?.name ||
      !option?.duration ||
      !option?.difficulty ||
      typeof option?.capacity !== "number" ||
      typeof option?.price !== "number" ||
      !Number.isFinite(Number(availabilityValue)) ||
      !Array.isArray(option?.images) ||
      option.images.length < 3
    ) {
      return {
        error:
          "Every adventure option must include name, duration, difficulty, capacity, price, availability and at least 3 images",
      };
    }
  }

  const normalizedFeatures = Array.isArray(features)
    ? features
        .map((feature: any) => (typeof feature === "string" ? feature.trim() : ""))
        .filter(Boolean)
    : [];

  const normalizedItinerary = Array.isArray(itinerary)
    ? itinerary
        .map((item: any, index: number) => {
          const heading =
            typeof item?.heading === "string" && item.heading.trim().length ? item.heading.trim() : `Day ${index + 1}`;
          const description = typeof item?.description === "string" ? item.description.trim() : "";
          return heading && description ? { heading, description } : null;
        })
        .filter((entry: any) => entry !== null)
    : [];

  const normalizeRichText = (value: any) => (typeof value === "string" ? value.trim() : "");

  const normalizedOptions = options.map((option: any) => ({
    name: option.name,
    description: option.description ?? "",
    duration: option.duration,
    difficulty: option.difficulty,
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
      duration,
      price: Number(price),
      capacity: Number(capacity),
      difficultyLevel: difficultyLevel?.trim() || undefined,
      features: normalizedFeatures,
      itinerary: normalizedItinerary,
      inclusions: normalizeRichText(inclusions),
      exclusions: normalizeRichText(exclusions),
      policyTerms: normalizeRichText(policyTerms),
      vendorMessage,
      defaultCancellationPolicy,
      defaultHouseRules,
    },
  };
};
// GET - Fetch adventures (vendor-specific or all for admin)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const all = searchParams.get("all") === "true"; // Admin/public view

    // Determine role
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
          { success: false, message: "Valid adventure ID is required" },
          { status: 400 }
        );
      }

      const adventure = await Adventure.findById(id)
        .populate("vendorId", "fullName email contactNumber")
        .lean();

      if (!adventure) {
        return NextResponse.json(
          { success: false, message: "Adventure not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, adventure });
    }

    let query: any = {};

    // Vendor filter (always honor vendorId when provided)
    if (vendorId) {
      if (mongoose.Types.ObjectId.isValid(vendorId)) {
        query.vendorId = new mongoose.Types.ObjectId(vendorId);
      } else {
        query.vendorId = vendorId;
      }
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Only active adventures unless admin wants all
    if (!all) {
      query.isActive = true;
    }

    // Public all=true without a specific vendor: exclude locked or unapproved vendors unless admin
    if (all && accountType !== "admin" && !vendorId) {
      const allowedVendors = await User.find({ accountType: "vendor", isVendorApproved: true, isVendorLocked: false }).select("_id");
      const allowedIds = allowedVendors.map((v) => v._id);
      query.vendorId = { $in: allowedIds };
    }

    const adventures = await Adventure.find(query)
      .populate("vendorId", "fullName email contactNumber")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, adventures });
  } catch (error: any) {
    console.error("Error fetching adventures:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch adventures" },
      { status: 500 }
    );
  }
}

// POST - Create a new adventure
export const POST = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const body = await req.json();
    const user = (req as any).user;

    // Only vendors can create
    if (user.accountType !== "vendor") {
      return NextResponse.json(
        { success: false, message: "Only vendors can create adventures" },
        { status: 403 }
      );
    }

    const vendorId = user.id;

    const { payload, error } = normalizeAdventurePayload(body);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status: 400 });
    }

    const adventure = await Adventure.create({
      vendorId,
      ...payload,
      isActive: true,
    });

    const populatedAdventure = await Adventure.findById(adventure._id).populate(
      "vendorId",
      "fullName email contactNumber"
    );

    return NextResponse.json(
      { success: true, adventure: populatedAdventure },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating adventure:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create adventure" },
      { status: 500 }
    );
  }
});

// PUT - Update an adventure
export const PUT = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const body = await req.json();
    const user = (req as any).user;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Valid adventure ID is required" },
        { status: 400 }
      );
    }

    const adventure = await Adventure.findById(id);
    if (!adventure) {
      return NextResponse.json(
        { success: false, message: "Adventure not found" },
        { status: 404 }
      );
    }

    if (user.accountType !== "admin" && adventure.vendorId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to update this adventure" },
        { status: 403 }
      );
    }

    const { payload, error } = normalizeAdventurePayload(body);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status: 400 });
    }

    Object.assign(adventure, payload);
    await adventure.save();

    const updatedAdventure = await Adventure.findById(id).populate(
      "vendorId",
      "fullName email contactNumber"
    );

    return NextResponse.json({ success: true, adventure: updatedAdventure });
  } catch (error: any) {
    console.error("Error updating adventure:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update adventure" },
      { status: 500 }
    );
  }
});

// DELETE - Delete an adventure by ID
export const DELETE = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const user = (req as any).user;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Valid adventure ID is required" },
        { status: 400 }
      );
    }

    const adventure = await Adventure.findById(id);
    if (!adventure) {
      return NextResponse.json(
        { success: false, message: "Adventure not found" },
        { status: 404 }
      );
    }

    // Only owner or admin
    if (user.accountType !== "admin" && adventure.vendorId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete this adventure" },
        { status: 403 }
      );
    }

    await Adventure.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Adventure deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting adventure:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete adventure" },
      { status: 500 }
    );
  }
});