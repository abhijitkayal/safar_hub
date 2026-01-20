import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Category from "@/models/Category";
import { auth } from "@/lib/middlewares/auth";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const dropLegacyCategoryIndexes = async () => {
  const collection = mongoose.connection.collections["categories"];
  if (!collection) return;

  const drop = async (name: string) => {
    try {
      await collection.dropIndex(name);
    } catch (err: any) {
      if (err?.codeName !== "IndexNotFound") {
        console.warn(`Failed to drop legacy index ${name}`, err?.message || err);
      }
    }
  };

  await Promise.all([drop("name_1"), drop("slug_1")]);
};

// GET - Get all categories (public)
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

  try {
    const query: any = {};
    const user = getOptionalUser(req);
    
    if (mine) {
      // For vendor's own categories
      const isSeller = user?.accountType === "vendor" && user?.isSeller;
      if (!isSeller) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 403 }
        );
      }
      query.ownerType = "vendor";
      query.owner = user.id || user._id;
    } else if (!all) {
      query.isActive = true;
      query.$or = [
        { ownerType: { $exists: false } },
        { ownerType: "admin" },
        { ownerType: "vendor" },
        { ownerType: null },
      ];
    }

    const categories = await Category.find(query)
      .sort({ displayOrder: 1, name: 1 })
      .select("name slug requiresVariants image displayOrder isActive ownerType owner");

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
};

// POST - Create a new category
export const POST = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    await dropLegacyCategoryIndexes();
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

    const { name, requiresVariants, image, displayOrder } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const slugQuery: any = { slug };
    if (isSeller) {
      slugQuery.ownerType = "vendor";
      slugQuery.owner = user.id || user._id;
    } else if (isAdmin) {
      slugQuery.$or = [{ ownerType: { $exists: false } }, { ownerType: null }, { ownerType: "admin" }];
    }

    const existing = await Category.findOne(slugQuery);
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category already exists" },
        { status: 400 }
      );
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      requiresVariants: !!requiresVariants,
      image: image || undefined,
      displayOrder: displayOrder || 0,
      isActive: true,
      ownerType: isSeller ? "vendor" : "admin",
      owner: isSeller ? user.id || user._id : null,
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
});

// PUT - Update a category
export const PUT = auth(async (req: NextRequest, context: any) => {
  try {
    await dbConnect();
    await dropLegacyCategoryIndexes();
    const body = await req.json();
    const user = (req as any).user;
    const { params } = context;
    const { id } = params;

    const isAdmin = user.accountType === "admin";
    const isSeller = user.accountType === "vendor" && user.isSeller;

    if (!isAdmin && !isSeller) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { name, requiresVariants, image, displayOrder, isActive } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    // Check if another category with the same slug exists (excluding current category)
    const slugFilter: any = { slug, _id: { $ne: id } };
    if (isSeller) {
      slugFilter.ownerType = "vendor";
      slugFilter.owner = user.id || user._id;
    } else if (isAdmin) {
      slugFilter.$or = [{ ownerType: { $exists: false } }, { ownerType: null }, { ownerType: "admin" }];
    }

    const existing = await Category.findOne(slugFilter);
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category with this name already exists" },
        { status: 400 }
      );
    }

    // Find the category first to check ownership
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Check ownership for vendors
    if (isSeller) {
      if (category.ownerType !== "vendor" || category.owner.toString() !== (user.id || user._id).toString()) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 403 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      slug,
      requiresVariants: !!requiresVariants,
      displayOrder: displayOrder || 0,
    };

    // Only admins can update image
    if (image !== undefined && isAdmin) {
      updateData.image = image;
    }

    // Only update isActive if provided
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return NextResponse.json({ success: true, category: updatedCategory });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
});

// DELETE - Delete a category
export const DELETE = auth(async (req: NextRequest, context: any) => {
  try {
    await dbConnect();
    const user = (req as any).user;
    const { params } = context;
    const { id } = params;

    const isAdmin = user.accountType === "admin";
    const isSeller = user.accountType === "vendor" && user.isSeller;

    if (!isAdmin && !isSeller) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Find the category
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Check ownership for vendors
    if (isSeller) {
      if (category.ownerType !== "vendor" || category.owner.toString() !== (user.id || user._id).toString()) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 403 }
        );
      }
    }

    // Delete the category
    await Category.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
});