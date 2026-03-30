"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";

interface AnnouncementBarSettings {
  enabled: boolean;
  text: string;
  highlightText: string;
  ctaText: string;
  ctaLink: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AnnouncementBarSettings>({
    enabled: true,
    text: "50% OFF on all AI Growth Packs today!",
    highlightText: "Flash Sale:",
    ctaText: "Claim offer →",
    ctaLink: "/pricing",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      try {
        const res = await fetch("/api/admin/announcement-bar", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/announcement-bar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
      } else {
        setMessage({ type: "error", text: "Failed to save settings" });
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Manage site-wide settings</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Announcement Bar Section */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Announcement Bar</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Configure the promotional banner displayed at the top of the site
                  </p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    settings.enabled
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {settings.enabled ? (
                    <>
                      <Eye className="w-4 h-4" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Disabled
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Highlight Text (colored)
                  </label>
                  <input
                    type="text"
                    value={settings.highlightText}
                    onChange={(e) => setSettings({ ...settings, highlightText: e.target.value })}
                    placeholder="Flash Sale:"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Main Text
                  </label>
                  <input
                    type="text"
                    value={settings.text}
                    onChange={(e) => setSettings({ ...settings, text: e.target.value })}
                    placeholder="50% OFF on all AI Growth Packs today!"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={settings.ctaText}
                      onChange={(e) => setSettings({ ...settings, ctaText: e.target.value })}
                      placeholder="Claim offer →"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CTA Link
                    </label>
                    <input
                      type="text"
                      value={settings.ctaLink}
                      onChange={(e) => setSettings({ ...settings, ctaLink: e.target.value })}
                      placeholder="/pricing"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-sm font-medium text-gray-400 mb-3">Preview:</p>
                  <div className="bg-zinc-950 border border-white/10 rounded-xl p-3">
                    <div className="flex items-center justify-center gap-3 text-sm">
                      <span className="text-indigo-400">🔥</span>
                      <span className="text-zinc-200">
                        <span className="font-semibold text-indigo-400">{settings.highlightText}</span>{" "}
                        {settings.text}
                      </span>
                      <span className="text-indigo-300 underline">{settings.ctaText}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between">
              {message && (
                <p
                  className={`text-sm ${
                    message.type === "success" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {message.text}
                </p>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="ml-auto flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
