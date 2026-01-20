// app/components/Pages/vendor/Dashboard.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import StatCard from "./StatCard";
import PurchasesChart from "./PurchasesChart";
import OrderTable from "./OrderTable";
import EarningsOverviewChart from "./EarningsOverviewChart";
import { CreditCard, Wallet, Clock, CheckCircle } from "lucide-react";

type DashboardProps = {
  locked: boolean;
  isSeller?: boolean;
};

export default function Dashboard({ locked, isSeller = false }: DashboardProps) {
  const [stats, setStats] = useState({
    todayPurchases: 0,
    totalPurchases: 0,
    todayEarnings: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [sellerCounts, setSellerCounts] = useState({ products: 0, categories: 0 });

  const fetchSellerSnapshot = useCallback(async () => {
    if (!isSeller || locked) return;
    setSellerLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`/api/products?mine=true&t=${Date.now()}`, {
          credentials: "include",
          cache: "no-store",
        }),
        fetch(`/api/categories?mine=true&t=${Date.now()}`, {
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      const [productsData, categoriesData] = await Promise.all([
        productsRes.json().catch(() => ({})),
        categoriesRes.json().catch(() => ({})),
      ]);

      setSellerCounts({
        products: Array.isArray(productsData?.products) ? productsData.products.length : 0,
        categories: Array.isArray(categoriesData?.categories) ? categoriesData.categories.length : 0,
      });
    } catch (err) {
      console.error("Failed to load seller snapshot", err);
    } finally {
      setSellerLoading(false);
    }
  }, [isSeller, locked]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Add cache-busting parameter to ensure fresh data
        const res = await fetch(`/api/vendor/stats?t=${Date.now()}`, { 
          credentials: "include",
          cache: "no-store"
        });
        const data = await res.json();
        if (data.success && data.stats) {
          setStats((prev) => ({
            ...prev,
            ...data.stats,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };

    if (!locked) {
      fetchStats();
    }
  }, [locked, refreshKey]);

  // Refresh when page becomes visible (user comes back to tab)
  useEffect(() => {
    if (locked) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setRefreshKey((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [locked]);

  // Refresh every 5 seconds when page is visible
  useEffect(() => {
    if (locked) return;

    const interval = setInterval(async () => {
      if (document.visibilityState === "visible") {
        try {
          // Add cache-busting parameter
          const res = await fetch(`/api/vendor/stats?t=${Date.now()}`, { 
            credentials: "include",
            cache: "no-store"
          });
          const data = await res.json();
          if (data.success && data.stats) {
            setStats(data.stats);
            // Also trigger child component refresh
            setRefreshKey((prev) => prev + 1);
          }
        } catch (error) {
          console.error("Failed to refresh stats", error);
        }
      }
    }, 5000); // 5 seconds for faster updates

    return () => clearInterval(interval);
  }, [locked]);

  useEffect(() => {
    fetchSellerSnapshot();
  }, [fetchSellerSnapshot, refreshKey]);

  const formatNumber = (n: number) => n.toLocaleString("en-IN");
  const formatINR = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    
    <div className="space-y-6 lg:pt-15 pt-0">
      <div className="flex justify-end">
        
        <button
          onClick={() => {
            setLoading(true);
            setRefreshKey((prev) => prev + 1);
          }}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow border text-gray-800 disabled:opacity-50 hover:bg-gray-50"
          title="Refresh data"
        >
          <span className="text-sm font-medium">🔄 Refresh</span>
        </button>
      </div>
      <div className={`space-y-6 transition-all ${locked ? "blur-[1.5px] pointer-events-none" : ""}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
            <StatCard
              title="Today's Purchases"
              value={loading ? "..." : formatNumber(stats.todayPurchases)}
              icon={<Clock />}
            />
            <StatCard
              title="Total Purchases"
              value={loading ? "..." : formatNumber(stats.totalPurchases)}
              icon={<Wallet />}
            />
            <StatCard
              title="Today's Earnings"
              value={loading ? "..." : formatINR(stats.todayEarnings)}
              icon={<CreditCard />}
            />
            <StatCard
              title="Total Earnings"
              value={loading ? "..." : formatINR(stats.totalEarnings)}
              icon={<CheckCircle />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            <div className="lg:col-span-2"><PurchasesChart refreshKey={refreshKey} /></div>
            <div className="lg:col-span-1"><EarningsOverviewChart refreshKey={refreshKey} /></div>
          </div>

          <div className="grid grid-cols-1 gap-6 w-full">
            <OrderTable refreshKey={refreshKey} />
          </div>

          {isSeller && (
            <section className="bg-white rounded-2xl shadow p-6 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-indigo-600 font-semibold">
                    Seller workspace
                  </p>
                  <h2 className="text-2xl font-semibold text-gray-900">Products & Categories</h2>
                  <p className="text-sm text-gray-500">
                    Manage everything you sell on SafarHub without leaving the dashboard.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (!locked) {
                      fetchSellerSnapshot();
                    }
                  }}
                  disabled={sellerLoading || locked}
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {sellerLoading ? "Refreshing…" : "Refresh"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SellerActionCard
                  title="Products"
                  href="/vendor/properties/seller/products"
                  count={sellerLoading ? "…" : sellerCounts.products.toString()}
                  description="Create, edit and publish the products you sell."
                  cta="Manage products"
                />
                <SellerActionCard
                  title="Categories"
                  href="/vendor/properties/seller/categories"
                  count={sellerLoading ? "…" : sellerCounts.categories.toString()}
                  description="Keep your catalogue organised with custom categories."
                  cta="Manage categories"
                />
              </div>
            </section>
          )}
        </div>
    </div>
  );
}

const SellerActionCard = ({
  title,
  count,
  description,
  cta,
  href,
}: {
  title: string;
  count: string;
  description: string;
  cta: string;
  href: string;
}) => {
  // Get the navigation function from context
  const context = typeof window !== 'undefined' ? (window as any).__VENDOR_NAVIGATE__ : null;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (context && context.navigate) {
      context.navigate(href);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm hover:shadow-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 text-left w-full"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{count}</p>
        </div>
        <span className="text-gray-300 text-2xl group-hover:text-green-500 transition">↗</span>
      </div>
      <p className="mt-4 text-sm text-gray-600">{description}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-green-700">
        {cta}
        <span aria-hidden className="transition group-hover:translate-x-1">
          →
        </span>
      </span>
    </button>
  );
};
