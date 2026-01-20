// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Stay from "@/models/Stay";
import Tour from "@/models/Tour";
import Adventure from "@/models/Adventure";
import VehicleRental from "@/models/VehicleRental";
import Coupon from "@/models/Coupon";

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Placed";

type OrderItem = {
  itemId: mongoose.Types.ObjectId;
  itemType: "Product" | "Stay" | "Tour" | "Adventure" | "VehicleRental";
  quantity: number;
  variantId?: mongoose.Types.ObjectId | null;
  variant?: {
    color?: string;
    size?: string;
    price?: number;
    photos?: string[];
  } | null;
  status?: OrderStatus;
  deliveryDate?: Date | null;
  itemData?: any;
};

type OrderLean = {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: OrderItem[];
  totalAmount: number;
  deliveryCharge: number;
  address: any;
  status: OrderStatus;
  createdAt: Date;
};

export const GET = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;

    const orders = (await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean()) as unknown as OrderLean[];

    // Populate item details
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const populatedItems = await Promise.all(
          order.items.map(async (item: OrderItem) => {
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
              const itemData = await Model.findById(item.itemId)
                .select("_id name images price basePrice category")
                .lean();
              return {
                ...item,
                itemData,
              };
            }
            return item;
          })
        );

        return {
          ...order,
          items: populatedItems,
        };
      })
    );

    return NextResponse.json({
      success: true,
      orders: populatedOrders,
    });
  } catch (error: any) {
    console.error("Orders GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
});

export const POST = auth(async (req: NextRequest) => {
  try {
    await dbConnect();
    const userId = (req as any).user.id;
    const body = await req.json();

    const { items, address, deliveryCharge = 15, couponCode } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Items are required" },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address is required" },
        { status: 400 }
      );
    }

    // Validate and calculate total amount
    let totalAmount = 0;
    const productStockUpdates: Array<{ productId: mongoose.Types.ObjectId; newStock: number }> = [];
    const variantStockUpdates: Array<{
      productId: mongoose.Types.ObjectId;
      variantId: mongoose.Types.ObjectId;
      newStock: number;
    }> = [];
    const normalizedItems: OrderItem[] = [];

    for (const item of items) {
      const { itemId, itemType, quantity, variantId } = item;

      if (!itemId || !itemType || !quantity || quantity < 1) {
        return NextResponse.json(
          { success: false, message: "Invalid item data" },
          { status: 400 }
        );
      }

      if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return NextResponse.json(
          { success: false, message: `Invalid item ID: ${itemId}` },
          { status: 400 }
        );
      }

      const itemObjectId = new mongoose.Types.ObjectId(itemId);
      let variantObjectId: mongoose.Types.ObjectId | null = null;
      let variantSnapshot: OrderItem["variant"] = null;

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
        default:
          return NextResponse.json(
            { success: false, message: "Invalid item type" },
            { status: 400 }
          );
      }

      const itemData = await Model.findById(itemObjectId);
      if (!itemData) {
        return NextResponse.json(
          { success: false, message: `Item not found: ${itemId}` },
          { status: 404 }
        );
      }

      if (itemType === "Product") {
        const hasVariants = Array.isArray(itemData.variants) && itemData.variants.length > 0;

        if (hasVariants) {
          if (!variantId) {
            return NextResponse.json(
              { success: false, message: "variantId is required for variant products" },
              { status: 400 }
            );
          }

          if (!mongoose.Types.ObjectId.isValid(variantId)) {
            return NextResponse.json(
              { success: false, message: "Invalid variantId" },
              { status: 400 }
            );
          }

          variantObjectId = new mongoose.Types.ObjectId(variantId);
          const variant = itemData.variants.id(variantObjectId);
          if (!variant) {
            return NextResponse.json(
              { success: false, message: "Selected variant not found" },
              { status: 404 }
            );
          }

          const variantStock = typeof variant.stock === "number" ? variant.stock : 0;
          if (itemData.outOfStock || variantStock <= 0) {
            return NextResponse.json(
              { success: false, message: "One or more products are out of stock" },
              { status: 400 }
            );
          }

          if (quantity > variantStock) {
            return NextResponse.json(
              { success: false, message: "Requested quantity exceeds available stock" },
              { status: 400 }
            );
          }

          variantSnapshot = {
            color: variant.color,
            size: variant.size,
            price: variant.price ?? undefined,
            photos: variant.photos ?? [],
          };

          variantStockUpdates.push({
            productId: itemData._id,
            variantId: variantObjectId,
            newStock: variantStock - quantity,
          });

          const price = variant.price ?? itemData.price ?? itemData.basePrice ?? 0;
          totalAmount += price * quantity;
        } else {
          const stockValue = typeof itemData.stock === "number" ? itemData.stock : null;
          if (itemData.outOfStock || (stockValue !== null && stockValue <= 0)) {
            return NextResponse.json(
              { success: false, message: "One or more products are out of stock" },
              { status: 400 }
            );
          }

          if (stockValue !== null && quantity > stockValue) {
            return NextResponse.json(
              { success: false, message: "Requested quantity exceeds available stock" },
              { status: 400 }
            );
          }

          if (stockValue !== null) {
            productStockUpdates.push({
              productId: itemData._id,
              newStock: stockValue - quantity,
            });
          }

          const price = itemData.price || itemData.basePrice || 0;
          totalAmount += price * quantity;
        }
      } else {
        const price = itemData.price || itemData.basePrice || 0;
        totalAmount += price * quantity;
      }

      normalizedItems.push({
        itemId: itemObjectId,
        itemType,
        quantity,
        variantId: variantObjectId,
        variant: variantSnapshot,
      });
    }

    // Handle Coupon
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      appliedCoupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });

      if (appliedCoupon) {
        const now = new Date();
        const isValid =
          appliedCoupon.startDate <= now &&
          appliedCoupon.expiryDate >= now &&
          totalAmount >= appliedCoupon.minPurchase &&
          (!appliedCoupon.usageLimit || appliedCoupon.usageCount < appliedCoupon.usageLimit);

        if (isValid) {
          if (appliedCoupon.discountType === "percentage") {
            discountAmount = (totalAmount * appliedCoupon.discountAmount) / 100;
            if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
              discountAmount = appliedCoupon.maxDiscount;
            }
          } else {
            discountAmount = appliedCoupon.discountAmount;
          }

          // Ensure discount doesn't exceed total
          discountAmount = Math.min(discountAmount, totalAmount);
          totalAmount -= discountAmount;
        }
      }
    }

    // Create order
    const orderItemsForSave = normalizedItems.map((item) => ({
      ...item,
      status: "Pending" as OrderStatus,
      deliveryDate: null,
    }));

    const order = await Order.create({
      user: userId,
      items: orderItemsForSave,
      totalAmount,
      deliveryCharge,
      address,
      status: "Pending",
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      discountAmount,
    });

    // Update coupon usage count
    if (appliedCoupon && discountAmount > 0) {
      await Coupon.findByIdAndUpdate(appliedCoupon._id, {
        $inc: { usageCount: 1 },
      });
    }

    if (productStockUpdates.length) {
      await Promise.all(
        productStockUpdates.map(({ productId, newStock }) =>
          Product.findByIdAndUpdate(productId, {
            stock: newStock,
            outOfStock: newStock <= 0,
          })
        )
      );
    }

    if (variantStockUpdates.length) {
      await Promise.all(
        variantStockUpdates.map(async ({ productId, variantId, newStock }) => {
          const product = await Product.findById(productId);
          if (!product) return;
          const variant = product.variants.id(variantId);
          if (!variant) return;
          variant.stock = newStock;
          product.outOfStock = product.variants.every(
            (variantDoc: any) => Number(variantDoc.stock) <= 0
          );
          await product.save();
        })
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error: any) {
    console.error("Order POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to place order" },
      { status: 500 }
    );
  }
});

