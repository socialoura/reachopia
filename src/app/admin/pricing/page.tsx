"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Loader2, Plus, Trash2, Save, Music } from "lucide-react";
import { InstagramIcon } from "@/components/ui/SocialIcons";

interface Tier {
  followers: string;
  price: string;
}

interface PricingData {
  instagram: Tier[];
  tiktok: Tier[];
}

export default function AdminPricingPage() {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const getToken = () => localStorage.getItem("adminToken");

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing");
      if (res.ok) {
        setPricing(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch pricing:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!pricing) return;
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(pricing),
      });

      if (res.ok) {
        setMessage("Pricing saved successfully!");
      } else {
        setMessage("Failed to save pricing.");
      }
    } catch {
      setMessage("Error saving pricing.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const updateTier = (
    platform: "instagram" | "tiktok",
    index: number,
    field: "followers" | "price",
    value: string
  ) => {
    if (!pricing) return;
    const updated = { ...pricing };
    updated[platform] = [...updated[platform]];
    updated[platform][index] = { ...updated[platform][index], [field]: value };
    setPricing(updated);
  };

  const addTier = (platform: "instagram" | "tiktok") => {
    if (!pricing) return;
    const updated = { ...pricing };
    updated[platform] = [
      ...updated[platform],
      { followers: "", price: "" },
    ];
    setPricing(updated);
  };

  const removeTier = (platform: "instagram" | "tiktok", index: number) => {
    if (!pricing) return;
    const updated = { ...pricing };
    updated[platform] = updated[platform].filter((_, i) => i !== index);
    setPricing(updated);
  };

  const renderPlatformSection = (
    platform: "instagram" | "tiktok",
    label: string,
    Icon: React.ComponentType<{ className?: string }>,
    colorClass: string
  ) => {
    const tiers = pricing?.[platform] || [];
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Icon className={`w-6 h-6 ${colorClass}`} />
            <h3 className="text-lg font-semibold text-white">{label}</h3>
          </div>
          <button
            onClick={() => addTier(platform)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Tier
          </button>
        </div>

        <div className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_40px] gap-3 px-1">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Followers
            </span>
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Price (USD)
            </span>
            <span />
          </div>

          {tiers.map((tier, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_1fr_40px] gap-3 items-center"
            >
              <input
                type="text"
                value={tier.followers}
                onChange={(e) =>
                  updateTier(platform, i, "followers", e.target.value)
                }
                placeholder="1000"
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="text"
                value={tier.price}
                onChange={(e) =>
                  updateTier(platform, i, "price", e.target.value)
                }
                placeholder="9.90"
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={() => removeTier(platform, i)}
                className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {tiers.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-6">
              No pricing tiers. Click &quot;Add Tier&quot; to create one.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Pricing Management
            </h1>
            <p className="text-gray-400 mt-1">
              Manage service prices for all platforms. Changes reflect
              instantly on the frontend.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !pricing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
              message.includes("success")
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          </div>
        ) : pricing ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderPlatformSection(
              "instagram",
              "Instagram Followers",
              InstagramIcon,
              "text-pink-400"
            )}
            {renderPlatformSection(
              "tiktok",
              "TikTok Followers",
              Music,
              "text-cyan-400"
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-24">
            Failed to load pricing data
          </p>
        )}
      </div>
    </AdminShell>
  );
}
