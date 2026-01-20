"use server";

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import Order, { type IOrderItem } from "@/models/Order";
import Product from "@/models/Product";

const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;

const normalizeStatus = (status?: string) => {
  if (!status) return "Pending";
  if (status === "Placed") return "Pending";
  if (ORDER_STATUSES.includes(status as any)) return status;
  return "Pending";
};

const deriveOrderStatus = (items: IOrderItem[]) => {
  if (!items?.length) return "Pending";
  const statuses = items.map((item) => normalizeStatus(item.status as any));
  if (statuses.every((state) => state === "Cancelled")) return "Cancelled";
  if (statuses.every((state) => state === "Delivered")) return "Delivered";
  if (statuses.some((state) => state === "Shipped")) return "Shipped";
  if (statuses.some((state) => state === "Processing")) return "Processing";
  return "Pending";
};

const parseDateInput = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = new Date(value as string);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const restoreProductStock = async (items: IOrderItem[]) => {
  await Promise.all(
    items
      .filter((item) => item.itemType === "Product")
      .map(async (item) => {
        const product = await Product.findById(item.itemId);
        if (!product) return;

        if (Array.isArray(product.variants) && product.variants.length > 0 && item.variantId) {
          const variant = product.variants.id(item.variantId);
          if (!variant) return;
          const currentStock = typeof variant.stock === "number" ? variant.stock : 0;
          variant.stock = currentStock + item.quantity;
          const hasInventory = product.variants.some(
            (variantDoc: any) => Number(variantDoc.stock ?? 0) > 0
          );
          product.outOfStock = !hasInventory;
        } else {
          const currentStock = typeof product.stock === "number" ? product.stock : 0;
          product.stock = currentStock + item.quantity;
          product.outOfStock = product.stock <= 0;
        }

        await product.save();
      })
  );
};

type RouteParams = { orderId: string };

export const PATCH = auth(async (req: NextRequest, context: { params: Promise<RouteParams> }) => {
  try {
    await dbConnect();

    const { orderId } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ success: false, message: "Invalid order id" }, { status: 400 });
    }

    const user = (req as any).user;
    const body = await req.json();

    if (body?.action === "cancel") {
      if (user.accountType !== "user") {
        return NextResponse.json({ success: false, message: "Only customers can cancel orders" }, { status: 403 });
      }

      const reason = (body?.reason || "").trim();
      if (!reason) {
        return NextResponse.json({ success: false, message: "Cancellation reason is required" }, { status: 400 });
      }

      const order = await Order.findOne({ _id: orderId, user: user.id });
      if (!order) {
        return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
      }

      const alreadyCancelled =
        normalizeStatus(order.status) === "Cancelled" ||
        order.items.every((item: IOrderItem) => normalizeStatus(item.status as any) === "Cancelled");

      if (alreadyCancelled) {
        return NextResponse.json({ success: false, message: "Order already cancelled" }, { status: 400 });
      }

      const delivered = order.items.some(
        (item: IOrderItem) => normalizeStatus(item.status as any) === "Delivered"
      );
      if (delivered) {
        return NextResponse.json({ success: false, message: "Delivered orders cannot be cancelled" }, { status: 400 });
      }

      const itemsToRestock = order.items.filter(
        (item: IOrderItem) => normalizeStatus(item.status as any) !== "Cancelled"
      );

      order.items.forEach((item: IOrderItem) => {
        item.status = "Cancelled";
        item.deliveryDate = null;
      });
      order.markModified("items");
      order.status = "Cancelled";
      order.cancellationReason = reason;
      order.cancelledBy = new mongoose.Types.ObjectId(user.id);
      order.cancelledAt = new Date();
      order.cancelledByRole = "user";

      await order.save();
      if (itemsToRestock.length) {
        await restoreProductStock(itemsToRestock);
      }
      return NextResponse.json({ success: true, order: order.toObject() });
    }

    const { itemId, variantId, itemType = "Product", status, deliveryDate } = body || {};

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      return NextResponse.json({ success: false, message: "Valid itemId is required" }, { status: 400 });
    }

    if (itemType !== "Product" && itemType !== "Stay" && itemType !== "Tour" && itemType !== "Adventure" && itemType !== "VehicleRental") {
      return NextResponse.json({ success: false, message: "Invalid item type" }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const targetItem = order.items.find((item: IOrderItem) => {
      const sameItem = item.itemId?.toString() === itemId && item.itemType === itemType;
      if (!sameItem) return false;
      if (!variantId) return true;
      return item.variantId?.toString() === variantId;
    });

    if (!targetItem) {
      return NextResponse.json({ success: false, message: "Order line item not found" }, { status: 404 });
    }

    const isAdmin = user.accountType === "admin";
    const isVendor = user.accountType === "vendor";

    if (!isAdmin && !isVendor) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    if (isVendor && itemType === "Product") {
      const product = await Product.findById(itemId).select("sellerId");
      if (!product || !product.sellerId || product.sellerId.toString() !== (user.id || user._id)) {
        return NextResponse.json({ success: false, message: "You cannot modify this order" }, { status: 403 });
      }
    }

    let itemsMutated = false;

    if (status && !ORDER_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status value" }, { status: 400 });
    }

    if (status) {
      targetItem.status = status;
      itemsMutated = true;
    }

    if (body.hasOwnProperty("deliveryDate")) {
      targetItem.deliveryDate = parseDateInput(deliveryDate);
      itemsMutated = true;
    }

    if (itemsMutated) {
      order.markModified("items");
    }

    order.status = deriveOrderStatus(order.items);

    await order.save();
    return NextResponse.json({ success: true, order: order.toObject() });
  } catch (error: any) {
    console.error("Order PATCH error:", error);
    return NextResponse.json({ success: false, message: "Unable to update order" }, { status: 500 });
  }
});

