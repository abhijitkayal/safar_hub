
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaPlus, FaTrash, FaTicketAlt, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { toast } from "react-hot-toast";

interface Coupon {
      _id: string;
      code: string;
      discountType: "percentage" | "fixed";
      discountAmount: number;
      minPurchase: number;
      maxDiscount?: number;
      expiryDate: string;
      usageLimit?: number;
      usageCount: number;
      isActive: boolean;
      createdAt: string;
}

export default function AdminCouponsPage() {
      const [loading, setLoading] = useState(true);
      const [coupons, setCoupons] = useState<Coupon[]>([]);
      const [error, setError] = useState<string | null>(null);

      useEffect(() => {
            loadCoupons();
      }, []);

      const loadCoupons = async () => {
            setLoading(true);
            setError(null);
            try {
                  const res = await fetch("/api/admin/coupons", {
                        cache: "no-store",
                        credentials: "include",
                  });
                  const data = await res.json();
                  if (!res.ok || !data.success) throw new Error(data?.message || "Failed to fetch coupons");
                  setCoupons(data.coupons || []);
            } catch (err: any) {
                  setError(err?.message || "Unable to fetch coupons");
            } finally {
                  setLoading(false);
            }
      };

      const handleDelete = async (id: string) => {
            if (!confirm("Are you sure you want to delete this coupon?")) return;

            try {
                  const res = await fetch(`/api/admin/coupons/${id}`, {
                        method: "DELETE",
                        credentials: "include",
                  });
                  const data = await res.json();
                  if (!res.ok || !data.success) throw new Error(data?.message || "Failed to delete coupon");
                  toast.success("Coupon deleted successfully");
                  loadCoupons();
            } catch (err: any) {
                  toast.error(err?.message || "Failed to delete coupon");
            }
      };

      const toggleStatus = async (id: string, currentStatus: boolean) => {
            try {
                  const res = await fetch(`/api/admin/coupons/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ isActive: !currentStatus }),
                        credentials: "include",
                  });
                  const data = await res.json();
                  if (!res.ok || !data.success) throw new Error(data?.message || "Failed to update coupon");
                  toast.success("Coupon status updated");
                  loadCoupons();
            } catch (err: any) {
                  toast.error(err?.message || "Failed to update status");
            }
      };

      return (
            <div className="space-y-6">
                  <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
                        <div>
                              <h1 className="text-2xl font-bold text-gray-900">Coupons Management</h1>
                              <p className="text-sm text-gray-500">Manage and create discount coupons for users.</p>
                        </div>
                        <Link
                              href="/admin/add-coupons"
                              className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition shadow-lg shadow-green-100"
                        >
                              <FaPlus /> Add Coupon
                        </Link>
                  </div>

                  <div className="min-h-[400px]">
                        {loading ? (
                              <div className="flex justify-center py-20">
                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
                              </div>
                        ) : error ? (
                              <div className="rounded-xl bg-red-50 p-6 text-red-700 border border-red-100">{error}</div>
                        ) : coupons.length === 0 ? (
                              <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-gray-100">
                                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                                          <FaTicketAlt size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">No coupons found</h3>
                                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">Create your first coupon to start offering discounts to your customers.</p>
                                    <Link
                                          href="/admin/add-coupons"
                                          className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 transition shadow-lg shadow-green-100"
                                    >
                                          <FaPlus /> Create First Coupon
                                    </Link>
                              </div>
                        ) : (
                              <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
                                    <div className="overflow-x-auto">
                                          <table className="w-full text-left text-sm text-gray-700">
                                                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                                      <tr>
                                                            <th className="px-6 py-4">Coupon Code</th>
                                                            <th className="px-6 py-4">Discount</th>
                                                            <th className="px-6 py-4">Usage</th>
                                                            <th className="px-6 py-4">Expiry</th>
                                                            <th className="px-6 py-4 text-center">Status</th>
                                                            <th className="px-6 py-4 text-right">Actions</th>
                                                      </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                      {coupons.map((coupon) => (
                                                            <tr key={coupon._id} className="hover:bg-gray-50/50 transition-colors">
                                                                  <td className="px-6 py-5">
                                                                        <span className="rounded-lg bg-green-50 px-3 py-1.5 font-mono text-base font-bold text-green-700 border border-green-100">
                                                                              {coupon.code}
                                                                        </span>
                                                                  </td>
                                                                  <td className="px-6 py-5">
                                                                        <div className="font-bold text-gray-900">
                                                                              {coupon.discountAmount}
                                                                              {coupon.discountType === "percentage" ? "% OFF" : " ₹ OFF"}
                                                                        </div>
                                                                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                                                                              Min: ₹{coupon.minPurchase}
                                                                        </div>
                                                                  </td>
                                                                  <td className="px-6 py-5">
                                                                        <div className="flex items-center gap-2">
                                                                              <div className="h-1.5 flex-1 max-w-[60px] rounded-full bg-gray-100 overflow-hidden">
                                                                                    <div
                                                                                          className="h-full bg-green-500 transition-all duration-500"
                                                                                          style={{ width: `${coupon.usageLimit ? (coupon.usageCount / coupon.usageLimit) * 100 : 0}%` }}
                                                                                    />
                                                                              </div>
                                                                              <span className="text-xs font-bold text-gray-600">
                                                                                    {coupon.usageCount} / {coupon.usageLimit || "∞"}
                                                                              </span>
                                                                        </div>
                                                                  </td>
                                                                  <td className="px-6 py-5">
                                                                        <span className={`text-xs font-medium ${new Date(coupon.expiryDate) < new Date() ? "text-red-500" : "text-gray-600"}`}>
                                                                              {new Date(coupon.expiryDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                                        </span>
                                                                  </td>
                                                                  <td className="px-6 py-5 text-center">
                                                                        <button
                                                                              onClick={() => toggleStatus(coupon._id, coupon.isActive)}
                                                                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${coupon.isActive
                                                                                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                                                          : "bg-red-100 text-red-700 hover:bg-red-200"
                                                                                    }`}
                                                                        >
                                                                              {coupon.isActive ? <FaToggleOn size={14} /> : <FaToggleOff size={14} />}
                                                                              {coupon.isActive ? "Active" : "Inactive"}
                                                                        </button>
                                                                  </td>
                                                                  <td className="px-6 py-5 text-right">
                                                                        <button
                                                                              onClick={() => handleDelete(coupon._id)}
                                                                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                                              title="Delete"
                                                                        >
                                                                              <FaTrash size={14} />
                                                                        </button>
                                                                  </td>
                                                            </tr>
                                                      ))}
                                                </tbody>
                                          </table>
                                    </div>
                              </div>
                        )}
                  </div>
            </div>
      );
}
