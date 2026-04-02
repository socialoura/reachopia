/* ═══════════════════════════════════════════════════════════════
   GET /api/scraper-instagram?username=xxx
   Returns Instagram profile info FAST (no posts).
   Posts are fetched in background and served by
   /api/scraper-instagram/posts?username=xxx
   ═══════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from "next/server";
import type { TiktokProfile } from "@/types/tiktok";
import {
  profileCache,
  fetchPostsInBackground,
  CACHE_TTL,
  isRateLimited,
  fetchWithTimeout,
  IG_RAPIDAPI_HOST,
  getApiKey,
} from "./shared";

/* ─── Search fallback: find user by full_name ─── */
async function searchInstagramByKeyword(
  keyword: string,
  headers: Record<string, string>
): Promise<{ username: string; fullName: string; avatarUrl: string } | null> {
  try {
    const res = await fetchWithTimeout(
      `https://${IG_RAPIDAPI_HOST}/api/instagram/search`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ query: keyword }),
      },
      10000
    );
    if (!res.ok) return null;
    const json = await res.json();
    const users: Array<Record<string, unknown>> =
      (json.result?.users as Array<Record<string, unknown>>) ??
      (json.users as Array<Record<string, unknown>>) ??
      (json.result as Array<Record<string, unknown>>) ??
      [];
    if (users.length === 0) return null;

    const kw = keyword.toLowerCase();
    const match = users.find((u) => {
      const user = (u.user ?? u) as Record<string, unknown>;
      const fullName = String(user.full_name ?? "").toLowerCase();
      const uname = String(user.username ?? "").toLowerCase();
      return fullName.includes(kw) || uname.includes(kw) || kw.includes(fullName);
    });

    if (!match) return null;
    const user = (match.user ?? match) as Record<string, unknown>;
    const uname = String(user.username ?? "");
    const fullName = String(user.full_name ?? "");
    const avatar = String(user.profile_pic_url ?? "");
    if (!uname) return null;
    return {
      username: uname,
      fullName,
      avatarUrl: avatar.startsWith("http")
        ? `/api/image-proxy?url=${encodeURIComponent(avatar)}`
        : avatar,
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    /* Rate limit */
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    /* Validate */
    const rawUsername = req.nextUrl.searchParams.get("username")?.replace(/^@/, "").trim();
    if (!rawUsername) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }
    const username = rawUsername.toLowerCase(); // for cache keys & comparison

    /* Check cache */
    const cached = profileCache.get(username);
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json(cached.data);
    }

    const apiKey = getApiKey();
    const headers: Record<string, string> = {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": IG_RAPIDAPI_HOST,
      "Content-Type": "application/json",
    };

    /* ─── Fetch profile ─── */
    // Try with original casing first, then lowercase if it fails
    let profileRes = await fetchWithTimeout(
      `https://${IG_RAPIDAPI_HOST}/api/instagram/profile`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ username: rawUsername }),
      },
    );

    if (!profileRes.ok && rawUsername !== username) {
      profileRes = await fetchWithTimeout(
        `https://${IG_RAPIDAPI_HOST}/api/instagram/profile`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ username }),
        },
      );
    }

    if (!profileRes.ok) {
      const text = await profileRes.text().catch(() => "");
      if (profileRes.status === 404 || text.includes("not found")) {
        const suggestion = await searchInstagramByKeyword(username, headers);
        if (suggestion) {
          return NextResponse.json(
            { error: "Profile not found", suggestion },
            { status: 404 }
          );
        }
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }
      throw new Error(`Instagram API ${profileRes.status}: ${text.slice(0, 200)}`);
    }

    const json = await profileRes.json();
    const result = json.result ?? json;

    if (!result.username) {
      const suggestion = await searchInstagramByKeyword(username, headers);
      if (suggestion) {
        return NextResponse.json(
          { error: "Profile not found", suggestion },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (result.is_private) {
      return NextResponse.json({ error: "This account is private" }, { status: 403 });
    }

    const avatarUrl =
      result.profile_pic_url_hd ?? result.profile_pic_url ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=18181b&color=fff&size=256&bold=true`;

    /* ─── Build profile (reuses TiktokProfile shape) ─── */
    /* The API may return either flat keys (follower_count) or
       GraphQL-style nested keys (edge_followed_by.count).
       We handle both formats gracefully. */
    const followersCount =
      result.follower_count ?? result.edge_followed_by?.count ?? 0;
    const followingCount =
      result.following_count ?? result.edge_follow?.count ?? 0;
    const mediaCount =
      result.media_count ?? result.edge_owner_to_timeline_media?.count ?? 0;

    const profile: TiktokProfile = {
      username: result.username ?? username,
      fullName: result.full_name ?? "",
      avatarUrl: avatarUrl.startsWith("http")
        ? `/api/image-proxy?url=${encodeURIComponent(avatarUrl)}`
        : avatarUrl,
      followersCount,
      followingCount,
      likesCount: 0,
      videoCount: mediaCount,
      bio: result.biography ?? "",
      verified: result.is_verified ?? false,
      posts: [],
    };

    /* Cache profile */
    profileCache.set(username, { data: profile, expiresAt: Date.now() + CACHE_TTL });

    /* ─── Kick off posts fetch in background ─── */
    fetchPostsInBackground(username);

    return NextResponse.json(profile);
  } catch (err) {
    console.error("[scraper-instagram] Error:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
