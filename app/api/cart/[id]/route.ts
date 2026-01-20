// app/api/cart/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import CartItem from "@/models/CartItem";
import Product from "@/models/Product";

export const DELETE = auth(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;
    const { id } = await params;
    const cartItemId = id;

    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      return NextResponse.json(
        { success: false, message: "Invalid cart item ID" },
        { status: 400 }
      );
    }

    const cartItem = await CartItem.findOne({
      _id: cartItemId,
      user: userId,
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: "Cart item not found" },
        { status: 404 }
      );
    }

    await CartItem.deleteOne({ _id: cartItemId });

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error: any) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to remove from cart" },
      { status: 500 }
    );
  }
});

export const PATCH = auth(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;
    const { id } = await params;
    const cartItemId = id;
    const body = await req.json();
    const { quantity } = body;

    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      return NextResponse.json(
        { success: false, message: "Invalid cart item ID" },
        { status: 400 }
      );
    }

    if (quantity !== undefined && (quantity < 1 || !Number.isInteger(quantity))) {
      return NextResponse.json(
        { success: false, message: "Quantity must be a positive integer" },
        { status: 400 }
      );
    }

    const cartItem = await CartItem.findOne({
      _id: cartItemId,
      user: userId,
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: "Cart item not found" },
        { status: 404 }
      );
    }

    if (quantity !== undefined) {
      if (cartItem.itemType !== "Product") {
        return NextResponse.json(
          { success: false, message: "Service quantity cannot be updated" },
          { status: 400 }
        );
      }

      const product = await Product.findById(cartItem.itemId);
      if (!product) {
        return NextResponse.json(
          { success: false, message: "Product not found" },
          { status: 404 }
        );
      }

      const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

      if (hasVariants) {
        if (!cartItem.variantId) {
          return NextResponse.json(
            { success: false, message: "Variant selection missing for this cart item" },
            { status: 400 }
          );
        }

        const variant = product.variants.id(cartItem.variantId);
        if (!variant) {
          return NextResponse.json(
            { success: false, message: "Selected variant not found" },
            { status: 404 }
          );
        }

        const variantStock = typeof variant.stock === "number" ? variant.stock : 0;
        if (product.outOfStock || variantStock <= 0) {
          return NextResponse.json(
            { success: false, message: "Item is out of stock" },
            { status: 400 }
          );
        }

        if (quantity > variantStock) {
          return NextResponse.json(
            { success: false, message: "Maximum stock reached" },
            { status: 400 }
          );
        }

        cartItem.quantity = quantity;
        await cartItem.save();
      } else {
        const stockValue = typeof product.stock === "number" ? product.stock : null;

        if (product.outOfStock || (stockValue !== null && stockValue <= 0)) {
          return NextResponse.json(
            { success: false, message: "Item is out of stock" },
            { status: 400 }
          );
        }

        if (stockValue !== null && quantity > stockValue) {
          return NextResponse.json(
            { success: false, message: "Maximum stock reached" },
            { status: 400 }
          );
        }

        cartItem.quantity = quantity;
        await cartItem.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cart item updated",
      cartItem,
    });
  } catch (error: any) {
    console.error("Cart PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update cart item" },
      { status: 500 }
    );
  }
});

