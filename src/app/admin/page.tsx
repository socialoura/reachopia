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
  Globe,
} from "lucide-react";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import { formatCurrency } from "@/lib/currency";

interface CountryStat {
  country_code: string;
  country_name: string;
  orders: number;
  revenue: number;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  last24h: number;
  monthly: Array<{ month: string; orders: number; revenue: number }>;
  byPlatform: Array<{ platform: string; count: number; revenue: number }>;
  byCountry: CountryStat[];
}

function countryFlag(code: string): string {
  if (!code || code === "XX") return "\uD83C\uDF10";
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
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
                      {formatCurrency(stats.totalRevenue, 'USD')}
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
                        {formatCurrency(p.revenue, 'USD')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Countries by Revenue */}
            {stats.byCountry && stats.byCountry.length > 0 && (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Top Countries by Revenue
                  </h3>
                </div>
                <div className="space-y-3">
                  {stats.byCountry.map((c, i) => {
                    const maxRevenue = stats.byCountry[0]?.revenue || 1;
                    const pct = Math.max((c.revenue / maxRevenue) * 100, 2);
                    return (
                      <div key={c.country_code} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg leading-none">{countryFlag(c.country_code)}</span>
                            <span className="text-sm font-medium text-white">{c.country_name}</span>
                            {i === 0 && (
                              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                                Top
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-400">{c.orders} orders</span>
                            <span className="font-semibold text-white min-w-[80px] text-right">
                              {formatCurrency(c.revenue, 'USD')}
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
                          {formatCurrency(m.revenue, 'USD')}
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
