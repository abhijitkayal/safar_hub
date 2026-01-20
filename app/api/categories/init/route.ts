import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Category from "@/models/Category";

// Initialize default categories (run once)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const defaultCategories = [
      { name: "Jacket", slug: "jacket", requiresVariants: true, displayOrder: 1, image: "/nav/jacket.webp" },
      { name: "T-Shirt", slug: "t-shirt", requiresVariants: true, displayOrder: 2, image: "/nav/t-shirt.webp" },
      { name: "Book", slug: "book", requiresVariants: false, displayOrder: 3 },
    ];

    const results = [];
    for (const cat of defaultCategories) {
      const existing = await Category.findOne({ slug: cat.slug });
      if (!existing) {
        const created = await Category.create(cat);
        results.push({ created: true, category: created });
      } else {
        results.push({ created: false, category: existing });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Categories initialized",
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to initialize categories" },
      { status: 500 }
    );
  }
}

