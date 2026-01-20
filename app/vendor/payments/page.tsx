"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Pages/vendor/Sidebar";
import { FaCheckCircle, FaClock, FaTimesCircle, FaSpinner } from "react-icons/fa";

export default function VendorPaymentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Get navigation function from global context
  const navigate = typeof window !== 'undefined' ? (window as any).__VENDOR_NAVIGATE__?.navigate : null;

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          credentials: "include",
        });

        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        const data = await res.json().catch(() => null);
        const verifiedUser = data?.user;
        if (!res.ok || !verifiedUser) {
          router.replace("/login");
          return;
        }

        if (verifiedUser.accountType !== "vendor") {
          router.replace("/login");
          return;
        }

        setUser(verifiedUser);
        setAuthorized(true);
        loadTransactions();
      } catch (err) {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [router]);

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const res = await fetch("/api/admin/transactions", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        // Filter transactions from the last 3 days
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        
        const filtered = (data.transactions || []).filter((txn: any) => {
          const txnDate = new Date(txn.createdAt);
          return txnDate >= threeDaysAgo;
        });

        // Sort by date (newest first)
        filtered.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setTransactions(filtered);
      }
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <FaCheckCircle className="text-green-500" size={20} />;
      case "processing":
        return <FaSpinner className="text-blue-500 animate-spin" size={20} />;
      case "cancelled":
        return <FaTimesCircle className="text-red-500" size={20} />;
      default:
        return <FaClock className="text-yellow-500" size={20} />;
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

  const getDayLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else if (date.toDateString() === twoDaysAgo.toDateString()) {
      return "2 Days Ago";
    } else {
      return formatDate(dateString);
    }
  };

  // Group transactions by day
  const groupedTransactions = transactions.reduce((acc: any, txn: any) => {
    const date = new Date(txn.createdAt).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(txn);
    return acc;
  }, {});

  const sortedDays = Object.keys(groupedTransactions).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  if (loading)
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );

  if (!authorized) return null;

  return (
     <div className="flex h-screen bg-gray-50 relative ">
                {/* Desktop sidebar */}
                   {/* <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen pt-15 overflow-y-auto overflow-x-hidden">
                  <Sidebar />
                </div> */}
      <div className="lg:pl-64 min-h-screen overflow-y-auto overflow-x-hidden">
        {/* Mobile Menu Button */}
        <div className="lg:hidden sticky top-0 z-40 bg-slate-50 px-4  pb-2 lg:pt-15 pt-0">
          {/* <button
            onClick={() => setMobileSidebarOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow border text-gray-800"
          >
            ☰ <span className="text-sm font-medium">Menu</span>
          </button> */}
        </div>
        <div className="p-6 lg:mt-20 mt-5 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payments & Transactions</h1>
            <p className="text-gray-600">View your transaction timeline for the last 3 days</p>
          </div>

          {loadingTransactions ? (
            <div className="flex justify-center py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">No transactions found in the last 3 days.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedDays.map((day) => (
                <div key={day} className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                    {getDayLabel(groupedTransactions[day][0].createdAt)}
                  </h2>
                  <div className="space-y-4">
                    {groupedTransactions[day].map((txn: any) => (
                      <div
                        key={txn._id}
                        className="border-l-4 border-indigo-500 pl-4 py-3 hover:bg-gray-50 rounded-r-lg transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusIcon(txn.status)}
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  txn.status
                                )}`}
                              >
                                {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                              </span>
                              {txn.amount && (
                                <span className="text-lg font-semibold text-gray-800">
                                  {txn.currency || "INR"} {txn.amount.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 mb-2">{txn.message}</p>
                            {txn.notes && (
                              <p className="text-sm text-gray-500 italic">Note: {txn.notes}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>
                                Created: {formatDate(txn.createdAt)}
                              </span>
                              {txn.scheduledDate && (
                                <span>
                                  Scheduled: {formatDate(txn.scheduledDate)}
                                </span>
                              )}
                              {txn.completedAt && (
                                <span>
                                  Completed: {formatDate(txn.completedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {/* {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-90 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-100 lg:hidden overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800">Menu</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="px-3 py-1.5 rounded-md border text-gray-700"
              >
                Close
              </button>
            </div>
            <Sidebar />
          </div>
        </>
      )} */}
    </div>
  );
}

