"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import {
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  Loader2,
  Music,
} from "lucide-react";
import { InstagramIcon } from "@/components/ui/SocialIcons";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  last24h: number;
  monthly: Array<{ month: string; orders: number; revenue: number }>;
  byPlatform: Array<{ platform: string; count: number; revenue: number }>;
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      try {
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const formatMonth = (m: string) => {
    const [year, month] = m.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  };

  return (
    <AdminShell>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">Overview of your business performance</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          </div>
        ) : stats ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Orders</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {stats.totalOrders}
                    </p>
                  </div>
                  <Package className="w-10 h-10 text-indigo-400" />
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                  <DollarSign className="w-10 h-10 text-green-400" />
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Today</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {stats.todayOrders}
                    </p>
                  </div>
                  <Clock className="w-10 h-10 text-yellow-400" />
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Last 24h</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {stats.last24h}
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Platform breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {stats.byPlatform.map((p) => (
                <div
                  key={p.platform}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-center gap-3 mb-4">
                    {p.platform === "instagram" ? (
                      <InstagramIcon className="w-6 h-6 text-pink-400" />
                    ) : (
                      <Music className="w-6 h-6 text-cyan-400" />
                    )}
                    <h3 className="text-lg font-semibold text-white capitalize">
                      {p.platform}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Orders</p>
                      <p className="text-2xl font-bold text-white">{p.count}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Revenue</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(p.revenue)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Monthly chart (bar chart with CSS) */}
            {stats.monthly.length > 0 && (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-6">
                  Monthly Revenue
                </h3>
                <div className="flex items-end gap-2 h-48 overflow-x-auto pb-2">
                  {(() => {
                    const maxRevenue = Math.max(
                      ...stats.monthly.map((m) => m.revenue),
                      1
                    );
                    return stats.monthly.map((m) => (
                      <div
                        key={m.month}
                        className="flex flex-col items-center flex-shrink-0 min-w-[60px]"
                      >
                        <span className="text-xs text-gray-400 mb-1">
                          {formatCurrency(m.revenue)}
                        </span>
                        <div
                          className="w-10 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all"
                          style={{
                            height: `${Math.max((m.revenue / maxRevenue) * 140, 4)}px`,
                          }}
                        />
                        <span className="text-xs text-gray-500 mt-2">
                          {formatMonth(m.month)}
                        </span>
                        <span className="text-xs text-gray-600">
                          {m.orders} orders
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <p className="text-gray-400">Failed to load analytics data</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
