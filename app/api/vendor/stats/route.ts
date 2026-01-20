import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import Booking from "@/models/Booking";
import Order from "@/models/Order";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { Types, PipelineStage } from "mongoose";

const getTokenVendorId = (req: NextRequest): string | null => {
  try {
    const token = req.cookies.get("token")?.value;
    if (token && process.env.JWT_SECRET) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { accountType?: string; id?: string; _id?: string };
      if (decoded?.accountType === "vendor") {
        return decoded?.id || decoded?._id || null;
      }
    }
  } catch {}
  return null;
};

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};
const addDays = (d: Date, delta: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + delta);
  return x;
};
const addMonths = (d: Date, delta: number) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + delta);
  return x;
};
const addYears = (d: Date, delta: number) => {
  const x = new Date(d);
  x.setFullYear(x.getFullYear() + delta);
  return x;
};

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const vendorId = getTokenVendorId(req);
    if (!vendorId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let vendorObjectId: Types.ObjectId;
    try {
      vendorObjectId = new Types.ObjectId(vendorId);
    } catch {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const vendorDoc = await User.findById(vendorObjectId).select("vendorServices isSeller");
    if (!vendorDoc) {
      return NextResponse.json({ success: false, message: "Vendor not found" }, { status: 404 });
    }

    const includeServices = Array.isArray(vendorDoc.vendorServices) ? vendorDoc.vendorServices.length > 0 : false;
    const includeProducts = Boolean(vendorDoc.isSeller);

    const vendorMatch = { vendorId: vendorObjectId };
    const activeBookingMatch = { status: { $ne: "cancelled" } };
    const earningsStatusMatch = { status: { $in: ["confirmed", "completed"] }, paymentStatus: { $ne: "refunded" } };

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const yesterdayStart = startOfDay(addDays(now, -1));
    const yesterdayEnd = endOfDay(addDays(now, -1));

    const aggTotal = (arr: Array<{ total: number }>) => (Array.isArray(arr) && arr.length ? arr[0].total : 0);

    let todayServicePurchasesCount = 0;
    let totalServicePurchasesCount = 0;
    let todayServiceAmount = 0;
    let yesterdayServiceAmount = 0;
    let totalServiceAmount = 0;
    let serviceWeekAgg: Array<{ _id: string; count: number }> = [];
    let serviceMonthAgg: Array<{ _id: string; count: number }> = [];
    let serviceYearAgg: Array<{ _id: string; count: number }> = [];
    type RecentPurchase = { _id: string; status: string; price: number; name: string; createdAt: Date; type: "Service" | "Product" };
    let recentServicePurchases: RecentPurchase[] = [];

    if (includeServices) {
      const [todayCount, totalCount] = await Promise.all([
        Booking.countDocuments({ ...vendorMatch, ...activeBookingMatch, createdAt: { $gte: todayStart, $lte: todayEnd } }),
        Booking.countDocuments({ ...vendorMatch, ...activeBookingMatch }),
      ]);
      todayServicePurchasesCount = todayCount;
      totalServicePurchasesCount = totalCount;

      const [todayAgg, yesterdayAgg, totalAgg] = await Promise.all([
        Booking.aggregate([
          { $match: { ...vendorMatch, ...earningsStatusMatch, updatedAt: { $gte: todayStart, $lte: todayEnd } } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Booking.aggregate([
          { $match: { ...vendorMatch, ...earningsStatusMatch, updatedAt: { $gte: yesterdayStart, $lte: yesterdayEnd } } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Booking.aggregate([
          { $match: { ...vendorMatch, ...earningsStatusMatch } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
      ]);

      todayServiceAmount = aggTotal(todayAgg);
      yesterdayServiceAmount = aggTotal(yesterdayAgg);
      totalServiceAmount = aggTotal(totalAgg);

      // Sales data: weekly, monthly, yearly booking counts
      const weekStart = startOfDay(addDays(now, -6));
      const monthStart = startOfDay(addMonths(now, -11));
      const yearStart = startOfDay(addYears(now, -2));

      [serviceWeekAgg, serviceMonthAgg, serviceYearAgg] = await Promise.all([
        Booking.aggregate([
          { $match: { ...vendorMatch, ...activeBookingMatch, createdAt: { $gte: weekStart, $lte: todayEnd } } },
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Booking.aggregate([
          { $match: { ...vendorMatch, ...activeBookingMatch, createdAt: { $gte: monthStart, $lte: todayEnd } } },
          { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Booking.aggregate([
          { $match: { ...vendorMatch, ...activeBookingMatch, createdAt: { $gte: yearStart, $lte: todayEnd } } },
          { $group: { _id: { $dateToString: { format: "%Y", date: "$createdAt" } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
      ]) as Array<Array<{ _id: string; count: number }>>;

      // Recent bookings with service names
      const recentAgg = (await Booking.aggregate([
        { $match: vendorMatch },
        { $sort: { createdAt: -1 } },
        { $limit: 15 },
        { $lookup: { from: "stays", localField: "stayId", foreignField: "_id", as: "stay" } },
        { $lookup: { from: "tours", localField: "tourId", foreignField: "_id", as: "tour" } },
        { $lookup: { from: "adventures", localField: "adventureId", foreignField: "_id", as: "adventure" } },
        { $lookup: { from: "vehiclerentals", localField: "vehicleRentalId", foreignField: "_id", as: "vehicle" } },
        {
          $addFields: {
            serviceName: {
              $ifNull: [
                { $arrayElemAt: ["$stay.name", 0] },
                {
                  $ifNull: [
                    { $arrayElemAt: ["$tour.name", 0] },
                    {
                      $ifNull: [
                        { $arrayElemAt: ["$adventure.name", 0] },
                        { $arrayElemAt: ["$vehicle.name", 0] },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          $project: {
            _id: 1,
            status: 1,
            price: "$totalAmount",
            serviceName: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
      ])) as Array<{ _id: Types.ObjectId; status: string; price: number; serviceName: string; createdAt: Date }>;

      recentServicePurchases = recentAgg.map((row) => ({
        _id: row._id.toString(),
        status: row.status,
        price: row.price,
        name: row.serviceName || "Service booking",
        createdAt: row.createdAt,
        type: "Service" as const,
      }));
    }

    const productBaseStages: PipelineStage[] = [
      { $unwind: "$items" },
      { $match: { "items.itemType": "Product", "items.status": { $ne: "Cancelled" } } },
      {
        $lookup: {
          from: "products",
          localField: "items.itemId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $match: { "product.sellerId": vendorObjectId } },
      {
        $addFields: {
          unitPrice: {
            $ifNull: [
              "$items.variant.price",
              { $ifNull: ["$product.basePrice", 0] },
            ],
          },
        },
      },
      {
        $addFields: {
          soldAmount: {
            $multiply: [
              "$unitPrice",
              {
                $cond: [
                  { $gt: ["$items.quantity", 0] },
                  "$items.quantity",
                  1,
                ],
              },
            ],
          },
        },
      },
    ];

    const buildProductStatsPipeline = (range?: { start: Date; end: Date }): PipelineStage[] => {
      const pipeline: PipelineStage[] = [];
      if (range) {
        pipeline.push({ $match: { createdAt: { $gte: range.start, $lte: range.end } } });
      }
      pipeline.push(...productBaseStages);
      pipeline.push({
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: "$soldAmount" },
        },
      });
      return pipeline;
    };

    const buildProductSeriesPipeline = (format: string, range: { start: Date; end: Date }): PipelineStage[] => {
      const pipeline: PipelineStage[] = [
        { $match: { createdAt: { $gte: range.start, $lte: range.end } } },
        ...productBaseStages,
        {
          $group: {
            _id: { $dateToString: { format, date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ];
      return pipeline;
    };

    let todayProductPurchasesCount = 0;
    let totalProductPurchasesCount = 0;
    let todayProductAmount = 0;
    let yesterdayProductAmount = 0;
    let totalProductAmount = 0;
    let productWeekAgg: Array<{ _id: string; count: number }> = [];
    let productMonthAgg: Array<{ _id: string; count: number }> = [];
    let productYearAgg: Array<{ _id: string; count: number }> = [];
    let recentProductPurchases: RecentPurchase[] = [];

    if (includeProducts) {
      const [todayRes, totalRes, yesterdayRes] = await Promise.all([
        Order.aggregate(buildProductStatsPipeline({ start: todayStart, end: todayEnd })),
        Order.aggregate(buildProductStatsPipeline()),
        Order.aggregate(buildProductStatsPipeline({ start: yesterdayStart, end: yesterdayEnd })),
      ]);

      todayProductPurchasesCount = Array.isArray(todayRes) && todayRes.length ? todayRes[0].count : 0;
      todayProductAmount = Array.isArray(todayRes) && todayRes.length ? todayRes[0].amount : 0;

      totalProductPurchasesCount = Array.isArray(totalRes) && totalRes.length ? totalRes[0].count : 0;
      totalProductAmount = Array.isArray(totalRes) && totalRes.length ? totalRes[0].amount : 0;

      yesterdayProductAmount = Array.isArray(yesterdayRes) && yesterdayRes.length ? yesterdayRes[0].amount : 0;

      const weekStart = startOfDay(addDays(now, -6));
      const monthStart = startOfDay(addMonths(now, -11));
      const yearStart = startOfDay(addYears(now, -2));

      [productWeekAgg, productMonthAgg, productYearAgg] = await Promise.all([
        Order.aggregate(buildProductSeriesPipeline("%Y-%m-%d", { start: weekStart, end: todayEnd })),
        Order.aggregate(buildProductSeriesPipeline("%Y-%m", { start: monthStart, end: todayEnd })),
        Order.aggregate(buildProductSeriesPipeline("%Y", { start: yearStart, end: todayEnd })),
      ]) as Array<Array<{ _id: string; count: number }>>;

      const productRecentAgg = (await Order.aggregate([
        { $sort: { createdAt: -1 } },
        ...productBaseStages,
        {
          $addFields: {
            lineId: {
              $concat: [
                { $toString: "$_id" },
                "-",
                { $toString: "$items.itemId" },
                "-",
                {
                  $cond: [
                    { $ifNull: ["$items.variantId", false] },
                    { $toString: "$items.variantId" },
                    "default",
                  ],
                },
              ],
            },
          },
        },
        {
          $project: {
            _id: "$lineId",
            status: "$items.status",
            price: "$soldAmount",
            name: "$product.name",
            createdAt: "$createdAt",
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
      ])) as Array<{ _id: string; status: string; price: number; name: string; createdAt: Date }>;

      recentProductPurchases = productRecentAgg.map((row) => ({
        ...row,
        type: "Product" as const,
      }));
    }

    type CountAgg = { _id: string; count: number };
    const mergeSeries = (serviceSeries: CountAgg[], productSeries: CountAgg[]) => {
      const map = new Map<string, number>();
      serviceSeries.forEach((entry) => map.set(entry._id, (map.get(entry._id) ?? 0) + entry.count));
      productSeries.forEach((entry) => map.set(entry._id, (map.get(entry._id) ?? 0) + entry.count));
      return Array.from(map.entries())
        .sort((a, b) => (a[0] > b[0] ? 1 : -1))
        .map(([name, value]) => ({ name, value }));
    };

    const purchasesData = {
      week: mergeSeries(serviceWeekAgg, productWeekAgg),
      month: mergeSeries(serviceMonthAgg, productMonthAgg),
      year: mergeSeries(serviceYearAgg, productYearAgg),
    };

    const mergedRecent = [...recentServicePurchases, ...recentProductPurchases]
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 5)
      .map((entry) => ({
        _id: `${entry.type}-${entry._id}`,
        type: entry.type,
        name: entry.name,
        price: entry.price,
        status: entry.status,
        createdAt: entry.createdAt,
      }));

    const todayPurchases = todayServicePurchasesCount + todayProductPurchasesCount;
    const totalPurchases = totalServicePurchasesCount + totalProductPurchasesCount;
    const todayEarnings = todayServiceAmount + todayProductAmount;
    const totalEarnings = totalServiceAmount + totalProductAmount;
    const yesterdayEarnings = yesterdayServiceAmount + yesterdayProductAmount;

    const earningsTrend = {
      today: {
        service: todayServiceAmount,
        product: todayProductAmount,
        total: todayEarnings,
      },
      yesterday: {
        service: yesterdayServiceAmount,
        product: yesterdayProductAmount,
        total: yesterdayEarnings,
      },
    };

    return NextResponse.json({
      success: true,
      capabilities: {
        services: includeServices,
        products: includeProducts,
      },
      stats: {
        todayPurchases,
        totalPurchases,
        todayEarnings,
        yesterdayEarnings,
        totalEarnings,
        todayServicePurchases: todayServicePurchasesCount,
        todayProductPurchases: todayProductPurchasesCount,
        totalServicePurchases: totalServicePurchasesCount,
        totalProductPurchases: totalProductPurchasesCount,
        todayServiceAmount,
        todayProductAmount,
        totalServiceAmount,
        totalProductAmount,
      },
      purchasesData,
      earningsTrend,
      recentPurchases: mergedRecent,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to compute vendor stats";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

