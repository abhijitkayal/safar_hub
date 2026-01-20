"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type PurchasesData = {
  name: string;
  value: number;
};

export default function PurchasesChart({ refreshKey = 0 }: { refreshKey?: number }) {
  const [data, setData] = useState<PurchasesData[]>([]);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchasesData = async () => {
      try {
        if (data.length === 0) setLoading(true);
        const res = await fetch(`/api/vendor/stats?t=${Date.now()}`, { 
          credentials: "include",
          cache: "no-store"
        });
        const result = await res.json();
        if (result.success && result.purchasesData) {
          const chartData = result.purchasesData[timeRange] || [];
          setData(chartData);
        }
      } catch (error) {
        console.error("Failed to fetch purchases data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasesData();
  }, [timeRange, refreshKey]);

  const formatLabel = (name: string) => {
    if (timeRange === "week") {
      // Format date as "MMM DD" - name is in format "YYYY-MM-DD"
      try {
        const [year, month, day] = name.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      } catch {
        return name;
      }
    } else if (timeRange === "month") {
      // Format as "MMM YYYY" - name is in format "YYYY-MM"
      try {
        const [year, month] = name.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      } catch {
        return name;
      }
    } else {
      // Year - name is in format "YYYY"
      return name;
    }
  };

  const formattedData = data.map((item) => ({
    ...item,
    name: formatLabel(item.name),
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow text-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Purchases Overview</h3>
        <select
          className="text-sm border p-1 rounded"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as "week" | "month" | "year")}
        >
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>

      <div className="h-56">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Loading...
          </div>
        ) : formattedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#incomeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
