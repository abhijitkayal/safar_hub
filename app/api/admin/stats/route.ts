import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/config/database";
import User from "@/models/User";
import Booking from "@/models/Booking";

// GET - Admin dashboard stats: users, orders, vendors, earnings(INR)
export async function GET(_req: NextRequest) {
	try {
		await dbConnect();

		// Totals
		const [totalUsers, totalVendors, totalOrders, earningsAgg] = await Promise.all([
			User.countDocuments({ accountType: "user" }),
			User.countDocuments({ accountType: "vendor" }),
			Booking.countDocuments({}),
			Booking.aggregate([
				{
					$match: {
						paymentStatus: "paid",
						currency: "INR",
						status: { $ne: "cancelled" },
					},
				},
				{
					$group: {
						_id: null,
						total: { $sum: "$totalAmount" },
					},
				},
			]),
		]);

		const earningsINR = Array.isArray(earningsAgg) && earningsAgg.length ? earningsAgg[0].total : 0;

		return NextResponse.json({
			success: true,
			totals: {
				users: totalUsers,
				orders: totalOrders,
				vendors: totalVendors,
				earningsINR,
			},
		});
	} catch (error: any) {
		console.error("Error computing admin stats:", error);
		return NextResponse.json(
			{ success: false, message: error?.message || "Failed to compute stats" },
			{ status: 500 }
		);
	}
}


