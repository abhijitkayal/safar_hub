"use server";

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/config/database";
import { auth } from "@/lib/middlewares/auth";
import Order from "@/models/Order";

const normalizeStatus = (status?: string | null) => {
  if (!status || status === "Placed") return "Pending";
  return status;
};

const formatStatusFilter = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const buildPipeline = (vendorId: mongoose.Types.ObjectId, statusFilter?: string | null) => {
  const pipeline: mongoose.PipelineStage[] = [
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "buyer",
      },
    },
    {
      $unwind: {
        path: "$buyer",
        preserveNullAndEmptyArrays: true,
      },
    },
    { $unwind: "$items" },
    { $match: { "items.itemType": "Product" } },
    {
      $lookup: {
        from: "products",
        localField: "items.itemId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $match: {
        "product.sellerId": vendorId,
      },
    },
    {
      $addFields: {
        unitPrice: {
          $ifNull: [
            "$items.variant.price",
            { $ifNull: ["$product.price", { $ifNull: ["$product.basePrice", 0] }] },
          ],
        },
      },
    },
    {
      $addFields: {
        soldAmount: { $multiply: ["$unitPrice", "$items.quantity"] },
      },
    },
  ];

  if (statusFilter) {
    pipeline.push({
      $match: {
        $or: [
          { "items.status": statusFilter },
          { status: statusFilter },
        ],
      },
    });
  }

  pipeline.push({ $sort: { createdAt: -1 } });

  return pipeline;
};

const mapRow = (row: any) => {
  const productImage =
    row?.items?.variant?.photos?.[0] ||
    row?.product?.images?.[0] ||
    row?.product?.photos?.[0] ||
    null;

  return {
    orderId: row?._id?.toString(),
    itemId: row?.items?.itemId?.toString(),
    variantId: row?.items?.variantId?.toString() ?? null,
    productName: row?.product?.name ?? "Unknown product",
    productImage,
    quantity: row?.items?.quantity ?? 0,
    unitPrice: row?.unitPrice ?? 0,
    soldAmount: row?.soldAmount ?? 0,
    buyerName: row?.address?.name ?? row?.buyer?.fullName ?? "Unknown",
    buyerEmail: row?.buyer?.email ?? null,
    buyerPhone: row?.address?.phone ?? row?.buyer?.contactNumber ?? null,
    buyerAddress: {
      line1: row?.address?.address ?? "",
      city: row?.address?.city ?? "",
      state: row?.address?.state ?? "",
      pincode: row?.address?.pincode ?? "",
    },
    deliveryDate: row?.items?.deliveryDate ?? null,
    status: normalizeStatus(row?.items?.status ?? row?.status),
    orderStatus: normalizeStatus(row?.status),
    orderCreatedAt: row?.createdAt ?? null,
    cancellationReason: row?.cancellationReason ?? null,
    cancelledAt: row?.cancelledAt ?? null,
    cancelledByRole: row?.cancelledByRole ?? null,
  };
};

export const GET = auth(async (req: NextRequest) => {
  try {
    const user = (req as any).user;
    if (user.accountType !== "vendor") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const vendorId = new mongoose.Types.ObjectId(user.id || user._id);
    const { searchParams } = new URL(req.url);
    const statusFilter = formatStatusFilter(searchParams.get("status"));
    const rows = await Order.aggregate(buildPipeline(vendorId, statusFilter));

    return NextResponse.json({ success: true, data: rows.map(mapRow) });
  } catch (error: any) {
    console.error("Vendor orders fetch failed:", error);
    return NextResponse.json({ success: false, message: "Failed to load vendor orders" }, { status: 500 });
  }
});

