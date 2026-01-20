import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import HeroSection from "@/models/HeroSection";
import { auth } from "@/lib/middlewares/auth";

const DEFAULT_HERO_CONTENT = {
  headline: "SafarHub, the North knows the way.",
  subheadline: "Handpicked stays, tours, adventures, and vehicles across the subcontinent.",
  description:
    "Plan immersive journeys across the Himalayas, coastlines, and hidden valleys. Compare verified vendors, lock in flexible bookings, and keep your travel crew in sync – all in one tab.",
  highlight: "Find",
  dynamicKeywords: [
    "Rooms",
    "Homestays",
    "BnBs",
    "Hotels",
    "Tours",
    "Group Tours",
    "Tour Packages",
    "Adventures",
    "Trekking",
    "Hiking",
    "Camping",
    "Water Rafting",
    "Vehicle Rentals",
    "Cars",
    "Bikes",
  ],
  backgroundImages: ["/hero/hero1.jpg", "/hero/hero2.jpg", "/hero/hero3.jpg"],
  primaryCta: { label: "Start exploring", href: "/stays" },
  secondaryCta: { label: "List your property", href: "/vendor" },
  stats: [
    { label: "Happy travellers", value: "15k+" },
    { label: "Verified partners", value: "1200+" },
    { label: "Average rating", value: "4.8/5" },
  ],
  featuredDestinations: ["Darjeeling", "Goa", "Sikkim", "Meghalaya"],
  bookingDefaults: {
    location: "Darjeeling",
    adults: 2,
    children: 0,
    rooms: 1,
  },
};

const sanitizeHeroPayload = (body: any) => {
  const payload: Record<string, any> = {};

  const assignString = (key: string) => {
    if (typeof body?.[key] === "string") {
      const value = body[key].trim();
      if (value) payload[key] = value;
    }
  };

  assignString("headline");
  assignString("subheadline");
  assignString("description");
  assignString("highlight");

  if (Array.isArray(body?.dynamicKeywords)) {
    const list = body.dynamicKeywords
      .map((item: any) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
    if (list.length) payload.dynamicKeywords = list;
  }

  if (Array.isArray(body?.backgroundImages)) {
    const images = body.backgroundImages
      .map((item: any) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
    if (images.length) payload.backgroundImages = images;
  }

  if (Array.isArray(body?.stats)) {
    const stats = body.stats
      .map((stat: any) => {
        const label = typeof stat?.label === "string" ? stat.label.trim() : "";
        const value = typeof stat?.value === "string" ? stat.value.trim() : "";
        return label && value ? { label, value } : null;
      })
      .filter(Boolean);
    if (stats.length) payload.stats = stats;
  }

  if (Array.isArray(body?.featuredDestinations)) {
    const destinations = body.featuredDestinations
      .map((item: any) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
    if (destinations.length) payload.featuredDestinations = destinations;
  }

  const mapCta = (ctaInput: any) => {
    if (!ctaInput || typeof ctaInput !== "object") return undefined;
    const label = typeof ctaInput.label === "string" ? ctaInput.label.trim() : "";
    const href = typeof ctaInput.href === "string" ? ctaInput.href.trim() : "";
    return label && href ? { label, href } : undefined;
  };

  const primaryCta = mapCta(body?.primaryCta);
  if (primaryCta) payload.primaryCta = primaryCta;

  const secondaryCta = mapCta(body?.secondaryCta);
  if (secondaryCta) payload.secondaryCta = secondaryCta;

  if (body?.bookingDefaults && typeof body.bookingDefaults === "object") {
    const booking = {
      location:
        typeof body.bookingDefaults.location === "string"
          ? body.bookingDefaults.location.trim()
          : undefined,
      adults:
        typeof body.bookingDefaults.adults === "number"
          ? Math.max(0, body.bookingDefaults.adults)
          : undefined,
      children:
        typeof body.bookingDefaults.children === "number"
          ? Math.max(0, body.bookingDefaults.children)
          : undefined,
      rooms:
        typeof body.bookingDefaults.rooms === "number"
          ? Math.max(0, body.bookingDefaults.rooms)
          : undefined,
    };

    Object.keys(booking).forEach(
      (key) => booking[key as keyof typeof booking] === undefined && delete booking[key as keyof typeof booking]
    );

    if (Object.keys(booking).length) {
      payload.bookingDefaults = booking;
    }
  }

  return payload;
};

const ensureHeroDocument = async () => {
  let hero = await HeroSection.findOne();
  if (!hero) {
    hero = new HeroSection(DEFAULT_HERO_CONTENT);
    await hero.save();
  }
  return hero;
};

export async function GET() {
  try {
    await dbConnect();
    const hero = await ensureHeroDocument();
    return NextResponse.json({ success: true, hero });
  } catch (error: any) {
    console.error("Hero GET error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load hero section" },
      { status: 500 }
    );
  }
}

export const PUT = auth(async (req: NextRequest, context: any) => {
  try {
    await dbConnect();
    const user = (req as any).user;

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only admins can update hero content" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const payload = sanitizeHeroPayload(body);

    if (!Object.keys(payload).length) {
      return NextResponse.json(
        { success: false, message: "Provide at least one updatable field" },
        { status: 400 }
      );
    }

    const hero = await ensureHeroDocument();
    Object.assign(hero, payload, { updatedBy: user.id });
    await hero.save();

    return NextResponse.json({ success: true, hero });
  } catch (error: any) {
    console.error("Hero PUT error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update hero section" },
      { status: 500 }
    );
  }
});
