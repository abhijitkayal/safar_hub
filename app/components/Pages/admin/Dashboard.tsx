//app/components/Pages/admin/Dashboard.tsx
"use client";
import React, { useEffect, useState } from "react";
import StatCard from "./StatCard";
import DashboardVendorTable from "./DashboardVendorTable";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<string>("0");
  const [orders, setOrders] = useState<string>("0");
  const [vendors, setVendors] = useState<string>("0");
  const [earnings, setEarnings] = useState<string>("₹0");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        const data = await res.json();
        if (data?.success) {
          const formatNumber = (n: number) => n.toLocaleString("en-IN");
          const formatINR = (n: number) =>
            new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(n);

          setUsers(formatNumber(data.totals.users || 0));
          setOrders(formatNumber(data.totals.orders || 0));
          setVendors(formatNumber(data.totals.vendors || 0));
          setEarnings(formatINR(data.totals.earningsINR || 0));
        }
      } catch (e) {
        // ignore UI errors
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6 text-gray-900  overflow-x-auto ">
      <h1 className="text-2xl font-semibold mb-2">Hi 👋</h1>
      <p className="text-gray-800 mb-6">Welcome to your dashboard!</p>

      {/* Responsive grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Users" value={loading ? "…" : users} color="bg-indigo-500" />
        <StatCard title="Total Orders" value={loading ? "…" : orders} color="bg-yellow-500" />
        <StatCard title="Total Vendors" value={loading ? "…" : vendors} color="bg-red-400" />
        <StatCard title="Total Earnings" value={loading ? "…" : earnings} color="bg-green-500" />
      </div>

      <DashboardVendorTable />
    </div>
  );
};

export default Dashboard;
