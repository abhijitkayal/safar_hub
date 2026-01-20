import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Product from "@/models/Product";
import { auth } from "@/lib/middlewares/auth";
import jwt from "jsonwebtoken";

const getOptionalUser = (req: NextRequest) => {
  try {
    const authHeader = req.headers.get("authorization");
    const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const cookieToken = req.cookies.get("token")?.value;
    const token = headerToken || cookieToken;
    if (!token || !process.env.JWT_SECRET) return null;
    return jwt.verify(token, process.env.JWT_SECRET) as any;
  } catch {
    return null;
  }
};

export const GET = async (req: NextRequest) => {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";
  const mine = searchParams.get("mine") === "true";
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sellerId = searchParams.get("sellerId");

  try {
    const query: any = {};
    const user = getOptionalUser(req);

    // If sellerId is provided, filter by that seller
    if (sellerId) {
      query.sellerId = sellerId;
    } else if (mine) {
      // For vendor's own products (requires auth)
      const isSeller = user?.accountType === "vendor" && user?.isSeller;
      if (!isSeller) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 403 }
        );
      }
      query.sellerId = user.id || user._id;
    } else if (!all) {
      query.isActive = true;
    }

    if (category && category !== "all") query.category = category;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 }).lean();

    // Ensure rating field exists for all products
    const normalizedProducts = products.map((p: any) => ({
      ...p,
      rating: p.rating || { average: 0, count: 0 },
    }));

    return NextResponse.json({ success: true, products: normalizedProducts });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
};

export const POST = auth(async (req: NextRequest, context: any) => {
  try {
    await dbConnect();
    const body = await req.json();
    const user = (req as any).user;

    const isAdmin = user.accountType === "admin";
    const isSeller = user.accountType === "vendor" && user.isSeller;

    if (!isAdmin && !isSeller) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { name, category, description, basePrice, images, variants, tags, stock, listingType, rentPriceDay } = body;

    if (!name || !category || !description || basePrice === undefined || !listingType) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (listingType === "rent" && !rentPriceDay) {
      return NextResponse.json(
        { success: false, message: "Rent price per day is required for rental listings" },
        { status: 400 }
      );
    }

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one image is required" },
        { status: 400 }
      );
    }

    const Category = (await import("@/models/Category")).default;
    const categoryDoc = await Category.findOne({ slug: category, isActive: true });

    if (!categoryDoc) {
      return NextResponse.json(
        { success: false, message: "Invalid category" },
        { status: 400 }
      );
    }

    if (categoryDoc.requiresVariants) {
      if (!variants || !Array.isArray(variants) || variants.length === 0) {
        return NextResponse.json(
          { success: false, message: `At least one variant is required for ${categoryDoc.name}` },
          { status: 400 }
        );
      }

      for (const variant of variants) {
        if (!variant.color || !variant.size || variant.stock === undefined) {
          return NextResponse.json(
            { success: false, message: "Each variant must have color, size, and stock" },
            { status: 400 }
          );
        }
      }
    }

    const normalizedStock =
      categoryDoc.requiresVariants || stock === undefined
        ? categoryDoc.requiresVariants
          ? undefined
          : 0
        : Math.max(Number(stock), 0);
    const outOfStock = categoryDoc.requiresVariants ? false : (normalizedStock ?? 0) <= 0;

    const product = await Product.create({
      name,
      category,
      description,
      basePrice,
      listingType,
      rentPriceDay: listingType === "rent" ? rentPriceDay : undefined,
      images,
      variants: variants || [],
      tags: tags || [],
      stock: categoryDoc.requiresVariants ? undefined : normalizedStock, // Add stock for non-variant products
      outOfStock,
      isActive: true,
      sellerId: isSeller ? user.id || user._id : null,
    });

    return NextResponse.json(
      { success: true, product },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
});