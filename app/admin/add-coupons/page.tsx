
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaSave, FaTicketAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function AddCouponPage() {
      const router = useRouter();
      const [loading, setLoading] = useState(false);
      const [formData, setFormData] = useState({
            code: "",
            discountType: "percentage",
            discountAmount: "",
            minPurchase: "0",
            maxDiscount: "",
            startDate: new Date().toISOString().split("T")[0],
            expiryDate: "",
            usageLimit: "",
      });

      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
      };

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setLoading(true);

            try {
                  const res = await fetch("/api/admin/coupons", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                              ...formData,
                              discountAmount: Number(formData.discountAmount),
                              minPurchase: Number(formData.minPurchase),
                              maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
                              usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
                        }),
                        credentials: "include",
                  });

                  const data = await res.json();
                  if (!res.ok || !data.success) throw new Error(data?.message || "Failed to create coupon");

                  toast.success("Coupon created successfully!");
                  router.push("/admin/coupons");
            } catch (err: any) {
                  toast.error(err?.message || "Failed to create coupon");
            } finally {
                  setLoading(false);
            }
      };

      return (
            <div className="mx-auto max-w-4xl space-y-6 pb-12">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-4">
                              <Link
                                    href="/admin/coupons"
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 hover:bg-gray-100 transition shadow-sm border border-gray-100"
                              >
                                    <FaArrowLeft />
                              </Link>
                              <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Create New Coupon</h1>
                                    <p className="text-sm text-gray-500">Add a new discount code for your customers</p>
                              </div>
                        </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
                              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    {/* Code */}
                                    <div className="col-span-full">
                                          <label className="mb-2 block text-sm font-bold text-gray-700 uppercase tracking-widest">
                                                Coupon Code <span className="text-red-500">*</span>
                                          </label>
                                          <div className="relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                                      <FaTicketAlt size={16} />
                                                </div>
                                                <input
                                                      type="text"
                                                      name="code"
                                                      placeholder="e.g. WELCOME10"
                                                      value={formData.code}
                                                      onChange={handleChange}
                                                      required
                                                      className="block w-full rounded-2xl border-gray-100 bg-gray-50 py-4 pl-12 pr-4 text-xl font-black uppercase tracking-widest text-gray-900 placeholder:text-gray-300 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 transition-all outline-none"
                                                />
                                          </div>
                                    </div>

                                    {/* Discount Type */}
                                    <div className="space-y-2">
                                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Discount Type
                                          </label>
                                          <select
                                                name="discountType"
                                                value={formData.discountType}
                                                onChange={handleChange}
                                                className="block w-full rounded-xl border-gray-100 bg-gray-50 p-4 text-gray-900 font-bold focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 transition-all outline-none appearance-none"
                                          >
                                                <option value="percentage">Percentage (%)</option>
                                                <option value="fixed">Fixed Amount (₹)</option>
                                          </select>
                                    </div>

                                    {/* Discount Amount */}
                                    <div className="space-y-2">
                                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Discount Value
                                          </label>
                                          <div className="relative">
                                                <input
                                                      type="number"
                                                      name="discountAmount"
                                                      placeholder={formData.discountType === "percentage" ? "10" : "500"}
                                                      value={formData.discountAmount}
                                                      onChange={handleChange}
                                                      required
                                                      min="0"
                                                      className="block w-full rounded-xl border-gray-100 bg-gray-50 p-4 text-gray-900 font-bold focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 transition-all outline-none"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                                                      {formData.discountType === "percentage" ? "%" : "₹"}
                                                </div>
                                          </div>
                                    </div>

                                    {/* Min Purchase */}
                                    <div className="space-y-2">
                                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Min. Purchase (₹)
                                          </label>
                                          <input
                                                type="number"
                                                name="minPurchase"
                                                value={formData.minPurchase}
                                                onChange={handleChange}
                                                min="0"
                                                className="block w-full rounded-xl border-gray-100 bg-gray-50 p-4 text-gray-900 font-bold focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 transition-all outline-none"
                                          />
                                    </div>

                                    {/* Usage Limit */}
                                    <div className="space-y-2">
                                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Global Usage Limit
                                          </label>
                                          <input
                                                type="number"
                                                name="usageLimit"
                                                placeholder="∞"
                                                value={formData.usageLimit}
                                                onChange={handleChange}
                                                min="1"
                                                className="block w-full rounded-xl border-gray-100 bg-gray-50 p-4 text-gray-900 font-bold focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 transition-all outline-none"
                                          />
                                    </div>

                                    {/* Start Date */}
                                    <div className="space-y-2">
                                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Start Date
                                          </label>
                                          <input
                                                type="date"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={handleChange}
                                                className="block w-full rounded-xl border-gray-100 bg-gray-50 p-4 text-gray-900 font-bold focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 transition-all outline-none"
                                          />
                                    </div>

                                    {/* Expiry Date */}
                                    <div className="space-y-2">
                                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Expiry Date
                                          </label>
                                          <input
                                                type="date"
                                                name="expiryDate"
                                                value={formData.expiryDate}
                                                onChange={handleChange}
                                                required
                                                className="block w-full rounded-xl border-gray-100 bg-gray-50 p-4 text-gray-900 font-bold focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 transition-all outline-none"
                                          />
                                    </div>
                              </div>

                              <div className="mt-12 flex items-center justify-end gap-4 border-t border-gray-50 pt-8">
                                    <Link
                                          href="/admin/coupons"
                                          className="rounded-xl bg-gray-50 px-8 py-4 font-bold text-gray-600 hover:bg-gray-100 transition"
                                    >
                                          Cancel
                                    </Link>
                                    <button
                                          type="submit"
                                          disabled={loading}
                                          className="flex items-center gap-2 rounded-xl bg-green-600 px-10 py-4 font-bold text-white hover:bg-green-700 disabled:opacity-50 transition shadow-lg shadow-green-100"
                                    >
                                          {loading ? (
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                          ) : (
                                                <>
                                                      <FaSave /> Create Coupon
                                                </>
                                          )}
                                    </button>
                              </div>
                        </div>
                  </form>
            </div>
      );
}
