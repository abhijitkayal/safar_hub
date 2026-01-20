import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { auth } from "@/lib/middlewares/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  // Await the params promise to get the actual params
  const { id } = await params;
  
  // Validate product ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid product ID" },
      { status: 400 }
    );
  }

  try {
    // Fetch the specific product by ID
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export const PUT = auth(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  await dbConnect();
  
  // Await the params promise to get the actual params
  const { id } = await params;
  
  // Validate product ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid product ID" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const user = (req as any).user;
    
    // Check if user is authorized to update this product
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }
    
    // Only seller who owns the product or admin can update it
    const isAdmin = user.accountType === "admin";
    const isOwner = user.accountType === "vendor" && user.isSeller && 
                   (product.sellerId?.toString() === (user.id || user._id).toString());
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to update this product" },
        { status: 403 }
      );
    }

    const { name, category, description, basePrice, images, variants, tags, isActive, stock } = body;

    // Validate required fields
    if (!name || !category || !description || basePrice === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one image is required" },
        { status: 400 }
      );
    }

    // Update product fields
    product.name = name;
    product.category = category;
    product.description = description;
    product.basePrice = basePrice;
    product.images = images;
    product.tags = tags || [];
    product.isActive = isActive !== undefined ? isActive : product.isActive;

    // Handle variants
    let isVariantProduct = (variants && Array.isArray(variants) && variants.length > 0) || (product.variants?.length || 0) > 0;

    if (variants && Array.isArray(variants)) {
      const Category = (await import("@/models/Category")).default;
      const categoryDoc = await Category.findOne({ slug: category, isActive: true });

      if (categoryDoc && categoryDoc.requiresVariants) {
        if (variants.length === 0) {
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
        
        product.variants = variants;
        product.outOfStock = variants.every((variant: any) => Number(variant.stock) <= 0);
        isVariantProduct = true;
      } else {
        // For non-variant products, set the stock field
        const normalizedStock = Math.max(Number(stock) || 0, 0);
        product.stock = normalizedStock;
        product.outOfStock = normalizedStock <= 0;
        isVariantProduct = false;
      }
    } else if (!isVariantProduct && stock !== undefined) {
      const normalizedStock = Math.max(Number(stock) || 0, 0);
      product.stock = normalizedStock;
      product.outOfStock = normalizedStock <= 0;
    }

    if (isVariantProduct && (!variants || !Array.isArray(variants))) {
      product.outOfStock = product.variants?.every((variant: any) => Number(variant.stock) <= 0) ?? product.outOfStock;
    }

    // Save updated product
    const updatedProduct = await product.save();

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
});

export const DELETE = auth(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  await dbConnect();
  
  // Await the params promise to get the actual params
  const { id } = await params;
  
  // Validate product ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid product ID" },
      { status: 400 }
    );
  }

  try {
    const user = (req as any).user;
    
    // Check if user is authorized to delete this product
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }
    
    // Only seller who owns the product or admin can delete it
    const isAdmin = user.accountType === "admin";
    const isOwner = user.accountType === "vendor" && user.isSeller && 
                   (product.sellerId?.toString() === (user.id || user._id).toString());
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete this product" },
        { status: 403 }
      );
    }

    // Delete the product
    await Product.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
});
