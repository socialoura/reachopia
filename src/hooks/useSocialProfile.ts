/* ═══════════════════════════════════════════════════════════════
   useSocialProfile — client hook to fetch social profile data
   Usage: const { profile, loading, error } = useSocialProfile("cristiano", "instagram");
   ═══════════════════════════════════════════════════════════════ */

import { useState, useEffect } from "react";

export interface SocialProfileData {
  username: string;
  platform: "instagram" | "tiktok";
  photoUrl: string | null;
  followersCount: number | null;
}

interface UseSocialProfileResult {
  profile: SocialProfileData | null;
  loading: boolean;
  error: string | null;
}

export function useSocialProfile(
  username: string | null | undefined,
  platform: "instagram" | "tiktok",
): UseSocialProfileResult {
  const [profile, setProfile] = useState<SocialProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const clean = username?.replace(/^@/, "").trim();
    if (!clean) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/social-profile?username=${encodeURIComponent(clean)}&platform=${platform}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: SocialProfileData) => {
        if (!cancelled) {
          setProfile(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[useSocialProfile]", err);
          setError(err.message ?? "Failed to load profile");
          setProfile({
            username: clean,
            platform,
            photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(clean)}&background=18181b&color=fff&size=256&bold=true`,
            followersCount: null,
          });
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [username, platform]);

  return { profile, loading, error };
}
