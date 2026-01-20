// app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import CartItem from "@/models/CartItem";
import Product from "@/models/Product";
import Stay from "@/models/Stay";
import Tour from "@/models/Tour";
import Adventure from "@/models/Adventure";
import VehicleRental from "@/models/VehicleRental";

type CartItemLean = {
  _id: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  itemType: "Product" | "Stay" | "Tour" | "Adventure" | "VehicleRental";
  quantity: number;
  variantId?: mongoose.Types.ObjectId | null;
};

export const GET = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;

    const cartItems = (await CartItem.find({ user: userId }).lean()) as unknown as CartItemLean[];

    const populatedItems = await Promise.all(
      cartItems.map(async (item) => {
        let itemData: any = null;
        let Model: any = null;

        switch (item.itemType) {
          case "Product":
            Model = Product;
            break;
          case "Stay":
            Model = Stay;
            break;
          case "Tour":
            Model = Tour;
            break;
          case "Adventure":
            Model = Adventure;
            break;
          case "VehicleRental":
            Model = VehicleRental;
            break;
        }

        if (Model) {
          itemData = await Model.findById(item.itemId)
            .select(
              "_id name images photos coverImage banner price basePrice category description location rating tags heroHighlights options stock outOfStock sellerId variants"
            )
            .lean();
        }

        if (!itemData) {
          return null;
        }

        let variantData = null;
        if (item.itemType === "Product" && item.variantId && Array.isArray(itemData?.variants)) {
          const variant = itemData.variants.find(
            (variant: any) => variant?._id?.toString() === item.variantId?.toString()
          );
          if (variant) {
            variantData = {
              _id: variant._id.toString(),
              color: variant.color,
              size: variant.size,
              stock: variant.stock,
              price: variant.price ?? null,
              photos: variant.photos ?? [],
            };
          }
        }

        if (item.itemType === "Product" && itemData?.variants) {
          delete itemData.variants;
        }

        return {
          _id: item._id.toString(),
          itemId: item.itemId.toString(),
          itemType: item.itemType,
          quantity: item.quantity,
          variantId: item.variantId ? item.variantId.toString() : null,
          variant: variantData,
          item: itemData,
        };
      })
    );

    const validItems = populatedItems.filter(Boolean);

    return NextResponse.json({
      success: true,
      cart: validItems,
    });
  } catch (error: any) {
    console.error("Cart GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cart" },
      { status: 500 }
    );
  }
});

export const POST = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;
    const body = await req.json();

    const { itemId, itemType, quantity = 1, variantId } = body;

    if (!itemId || !itemType) {
      return NextResponse.json(
        { success: false, message: "itemId and itemType are required" },
        { status: 400 }
      );
    }

    if (!["Product", "Stay", "Tour", "Adventure", "VehicleRental"].includes(itemType)) {
      return NextResponse.json(
        { success: false, message: "Invalid itemType" },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { success: false, message: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return NextResponse.json(
        { success: false, message: "Invalid itemId format" },
        { status: 400 }
      );
    }

    const itemObjectId = new mongoose.Types.ObjectId(itemId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Verify item exists
    let Model: any = null;
    switch (itemType) {
      case "Product":
        Model = Product;
        break;
      case "Stay":
        Model = Stay;
        break;
      case "Tour":
        Model = Tour;
        break;
      case "Adventure":
        Model = Adventure;
        break;
      case "VehicleRental":
        Model = VehicleRental;
        break;
    }

    const itemExists = await Model.findById(itemObjectId);
    if (!itemExists) {
      return NextResponse.json(
        { success: false, message: "Item not found" },
        { status: 404 }
      );
    }

    const normalizedQuantity = itemType === "Product" ? quantity : 1;

    let variantObjectId: mongoose.Types.ObjectId | null = null;

    if (itemType === "Product") {
      const hasVariants = Array.isArray(itemExists.variants) && itemExists.variants.length > 0;

      if (hasVariants) {
        if (!variantId) {
          return NextResponse.json(
            { success: false, message: "variantId is required for variant products" },
            { status: 400 }
          );
        }
        if (!mongoose.Types.ObjectId.isValid(variantId)) {
          return NextResponse.json(
            { success: false, message: "Invalid variantId format" },
            { status: 400 }
          );
        }
        variantObjectId = new mongoose.Types.ObjectId(variantId);
        const variant = itemExists.variants.id(variantObjectId);
        if (!variant) {
          return NextResponse.json(
            { success: false, message: "Variant not found" },
            { status: 404 }
          );
        }
        const variantStock = typeof variant.stock === "number" ? variant.stock : 0;
        if (itemExists.outOfStock || variantStock <= 0) {
          return NextResponse.json(
            { success: false, message: "Item is out of stock" },
            { status: 400 }
          );
        }
        if (normalizedQuantity > variantStock) {
          return NextResponse.json(
            { success: false, message: "Maximum stock reached" },
            { status: 400 }
          );
        }
      } else {
        const stockValue = typeof itemExists.stock === "number" ? itemExists.stock : null;
        if (itemExists.outOfStock || (stockValue !== null && stockValue <= 0)) {
          return NextResponse.json(
            { success: false, message: "Item is out of stock" },
            { status: 400 }
          );
        }
        if (stockValue !== null && normalizedQuantity > stockValue) {
          return NextResponse.json(
            { success: false, message: "Maximum stock reached" },
            { status: 400 }
          );
        }
      }
    }

    // Check if already in cart
    const existingQuery: any = {
      user: userObjectId,
      itemId: itemObjectId,
      itemType,
    };
    if (variantObjectId) {
      existingQuery.variantId = variantObjectId;
    }
    const existing = await CartItem.findOne(existingQuery);

    if (existing) {
      // Update quantity
      existing.quantity = normalizedQuantity;
      await existing.save();
      return NextResponse.json({
        success: true,
        message: "Cart updated",
        cartItem: existing,
      });
    }

    // Create new cart item
    const cartItem = await CartItem.create({
      user: userObjectId,
      itemId: itemObjectId,
      itemType,
      quantity: normalizedQuantity,
      variantId: variantObjectId,
    });

    return NextResponse.json({
      success: true,
      message: "Item added to cart",
      cartItem,
    });
  } catch (error: any) {
    console.error("Cart POST error:", error);

    // Handle ObjectId casting errors specifically
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return NextResponse.json(
        { success: false, message: "Invalid ID format" },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        message: "Item already in cart",
      });
    }

    return NextResponse.json(
      { success: false, message: "Failed to add to cart" },
      { status: 500 }
    );
  }
});

