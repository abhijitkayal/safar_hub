"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

type TrendPoint = {
  period: string;
  service: number;
  product: number;
  total: number;
};

export default function EarningsOverviewChart({ refreshKey = 0 }: { refreshKey?: number }) {
  const [data, setData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [supportsServices, setSupportsServices] = useState(true);
  const [supportsProducts, setSupportsProducts] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        if (data.length === 0) setLoading(true);
        const res = await fetch(`/api/vendor/stats?t=${Date.now()}`, { 
          credentials: "include",
          cache: "no-store"
        });
        const payload = await res.json();
        if (payload.success && payload.earningsTrend) {
          const caps = payload.capabilities || {};
          setSupportsServices(caps.services ?? true);
          setSupportsProducts(caps.products ?? true);
          const { today, yesterday } = payload.earningsTrend;
          const chartData: TrendPoint[] = [
            {
              period: "Today",
              service: today?.service ?? 0,
              product: today?.product ?? 0,
              total: today?.total ?? 0,
            },
            {
              period: "Yesterday",
              service: yesterday?.service ?? 0,
              product: yesterday?.product ?? 0,
              total: yesterday?.total ?? 0,
            },
          ];
          setData(chartData);
        }
      } catch (error) {
        console.error("Failed to fetch earnings data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [refreshKey]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full text-gray-900">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Earnings Overview</h3>
      </div>

      <div className="w-full h-48">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-xs">
            Loading...
          </div>
        ) : data.every((point) => point.total === 0) ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-xs">
            No earnings data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="period" stroke="#888" />
              <YAxis stroke="#888" tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              {(supportsServices || supportsProducts) && <Legend />}
              {supportsServices && <Bar dataKey="service" stackId="earnings" fill="#0ea5e9" name="Service" />}
              {supportsProducts && <Bar dataKey="product" stackId="earnings" fill="#a855f7" name="Product" />}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {data.map((point) => (
          <div key={point.period} className="rounded-lg border border-gray-100 p-2">
            <p className="text-gray-500">{point.period}</p>
            <p className="text-base font-semibold">{formatCurrency(point.total)}</p>
            <p className="text-[11px] text-gray-500">
              {supportsServices && (
                <span>
                  {formatCurrency(point.service)} services
                  {supportsProducts ? " • " : ""}
                </span>
              )}
              {supportsProducts && <span>{formatCurrency(point.product)} products</span>}
              {!supportsServices && !supportsProducts && "No earnings available"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
