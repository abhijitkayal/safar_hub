"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaCheckCircle, FaClock, FaTimesCircle, FaSpinner } from "react-icons/fa";

export default function AdminTransactionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [activeTab, setActiveTab] = useState<"create" | "manage">("create");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  const [formData, setFormData] = useState({
    vendorId: "",
    message: "",
    amount: "",
    currency: "INR",
    scheduledDate: "",
    notes: "",
  });

  const loadVendors = useCallback(async () => {
    try {
      setLoadingVendors(true);
      const res = await fetch("/api/admin/vendors", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setVendors(data.vendors || []);
      }
    } catch (err) {
      console.error("Failed to load vendors", err);
    } finally {
      setLoadingVendors(false);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      setLoadingTransactions(true);
      const res = await fetch("/api/admin/transactions", { credentials: "include" });

      if (!res.ok) {
        const text = await res.text();
        console.error(`Failed to load transactions: ${res.status} ${res.statusText}`, text.slice(0, 100));
        return;
      }

      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify", { credentials: "include" });
        if (res.status !== 200) return router.replace("/login");
        const data = await res.json().catch(() => null);
        const verifiedUser = data?.user;
        if (!res.ok || !verifiedUser) return router.replace("/login");
        if (verifiedUser.accountType !== "admin") return router.replace("/login");
        setAuthorized(true);
        loadVendors();
        loadTransactions();
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [router, loadVendors, loadTransactions]);

  const handleStatusChange = async (transactionId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }

      await loadTransactions();
      alert("Status updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <FaCheckCircle className="text-green-500" size={16} />;
      case "processing":
        return <FaSpinner className="text-blue-500 animate-spin" size={16} />;
      case "cancelled":
        return <FaTimesCircle className="text-red-500" size={16} />;
      default:
        return <FaClock className="text-yellow-500" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vendorId || !formData.message || !formData.scheduledDate) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          vendorId: formData.vendorId,
          message: formData.message,
          amount: formData.amount ? parseFloat(formData.amount) : undefined,
          currency: formData.currency,
          scheduledDate: new Date(formData.scheduledDate).toISOString(),
          notes: formData.notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create transaction");
      }

      setFormData({
        vendorId: "",
        message: "",
        amount: "",
        currency: "INR",
        scheduledDate: "",
        notes: "",
      });

      await loadTransactions();
      setActiveTab("manage");
      alert("Transaction created successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to create transaction");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  if (!authorized) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
      </div>

      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("create")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === "create"
            ? "border-green-600 text-green-600"
            : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
        >
          Create Transaction
        </button>
        <button
          onClick={() => {
            setActiveTab("manage");
            loadTransactions();
          }}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === "manage"
            ? "border-green-600 text-green-600"
            : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
        >
          Manage Transactions
        </button>
      </div>

      {activeTab === "create" ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="vendorId" className="block text-sm font-bold text-gray-700 mb-2">
                  Vendor <span className="text-red-500">*</span>
                </label>
                {loadingVendors ? (
                  <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                ) : (
                  <select
                    id="vendorId"
                    value={formData.vendorId}
                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all bg-gray-50/50"
                  >
                    <option value="">Select a vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor._id} value={vendor._id}>
                        {vendor.fullName} ({vendor.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all bg-gray-50/50"
                  placeholder="Enter transaction message..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-bold text-gray-700 mb-2">
                    Amount (Optional)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all bg-gray-50/50"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-bold text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all bg-gray-50/50"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="scheduledDate" className="block text-sm font-bold text-gray-700 mb-2">
                  Scheduled Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all bg-gray-50/50"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-bold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all bg-gray-50/50"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-100 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Submit Transaction"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="w-full">
          {loadingTransactions ? (
            <div className="flex justify-center py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-gray-500 font-medium">No transactions found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Vendor</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Message</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.map((txn: any) => (
                      <tr key={txn._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(txn.status)}
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(
                                txn.status
                              )}`}
                            >
                              {txn.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">
                            {txn.vendorId && typeof txn.vendorId === "object"
                              ? txn.vendorId.fullName || txn.vendorId.email
                              : "Unknown"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate" title={txn.message}>
                            {txn.message}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-black text-gray-900">
                            {txn.amount
                              ? `₹${txn.amount.toLocaleString()}`
                              : "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-500 font-medium">{formatDate(txn.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            value={txn.status}
                            onChange={(e) => handleStatusChange(txn._id, e.target.value)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all bg-white"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
