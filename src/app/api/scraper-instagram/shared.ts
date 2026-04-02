/* ═══════════════════════════════════════════════════════════════
   Shared utilities for Instagram scraper routes
   - Caches (profile + posts)
   - Background post fetcher
   - Rate limiter, fetch helpers
   ═══════════════════════════════════════════════════════════════ */

import type { TiktokProfile, TiktokPost } from "@/types/tiktok";

/* We reuse TiktokProfile/TiktokPost types since the shape is compatible */

/* ─── Constants ─── */
export const CACHE_TTL = 5 * 60 * 1000;
export const IG_RAPIDAPI_HOST = "instagram120.p.rapidapi.com";

/* ─── Caches ─── */
export const profileCache = new Map<string, { data: TiktokProfile; expiresAt: number }>();
export const postsCache = new Map<string, { data: TiktokPost[]; expiresAt: number }>();

/** Track in-flight post fetches so we don't duplicate */
const postFetchInFlight = new Map<string, Promise<TiktokPost[]>>();

/* ─── Rate limiter ─── */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 15;
const RATE_LIMIT_WINDOW = 60_000;

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

/* ─── Fetch with timeout ─── */
export async function fetchWithTimeout(url: string, opts: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export function getApiKey(): string {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error("RAPIDAPI_KEY is not set");
  return key;
}

/* ─── Parse posts from Instagram API response ─── */
export function parsePosts(data: Record<string, unknown>): TiktokPost[] {
  const result = data.result as Record<string, unknown> | undefined;
  if (!result) return [];

  const edges = (result.edges as Array<Record<string, unknown>>) ?? [];

  return edges.slice(0, 12).map((edge) => {
    const node = (edge.node ?? edge) as Record<string, unknown>;

    const imageVersions = node.image_versions2 as Record<string, unknown> | undefined;
    const candidates = (imageVersions?.candidates as Array<Record<string, unknown>>) ?? [];
    const displayUrl = (candidates[0]?.url as string) ?? (node.display_url as string) ?? "";

    const caption = node.caption as Record<string, unknown> | undefined;
    const captionText = (caption?.text as string) ?? "";

    return {
      id: String(node.id ?? node.code ?? ""),
      imageUrl: displayUrl.startsWith("http")
        ? `/api/image-proxy?url=${encodeURIComponent(displayUrl)}`
        : displayUrl,
      caption: captionText.slice(0, 150),
      likesCount: (node.like_count as number) ?? 0,
      commentsCount: (node.comment_count as number) ?? 0,
      viewsCount: (node.video_view_count as number) ?? 0,
      isVideo: (node.is_video as boolean) ?? false,
    } satisfies TiktokPost;
  });
}

/* ─── Background post fetcher ─── */
export function fetchPostsInBackground(username: string): void {
  const cached = postsCache.get(username);
  if (cached && Date.now() < cached.expiresAt) return;

  if (postFetchInFlight.has(username)) return;

  const promise = (async (): Promise<TiktokPost[]> => {
    try {
      const apiKey = getApiKey();
      const headers: Record<string, string> = {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": IG_RAPIDAPI_HOST,
        "Content-Type": "application/json",
      };

      const postsRes = await fetchWithTimeout(
        `https://${IG_RAPIDAPI_HOST}/api/instagram/posts`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ username, maxId: "" }),
        },
        20000,
      );

      if (!postsRes.ok) return [];
      const postsJson = await postsRes.json();
      const posts = parsePosts(postsJson);

      postsCache.set(username, { data: posts, expiresAt: Date.now() + CACHE_TTL });

      // Also update profile cache with posts
      const profileEntry = profileCache.get(username);
      if (profileEntry) {
        profileEntry.data = { ...profileEntry.data, posts };
      }

      return posts;
    } catch (err) {
      console.warn("[scraper-instagram] Background post fetch failed:", err);
      return [];
    } finally {
      postFetchInFlight.delete(username);
    }
  })();

  postFetchInFlight.set(username, promise);
}

/** Wait for an in-flight post fetch, or return cached data */
export async function getPosts(username: string): Promise<TiktokPost[]> {
  const cached = postsCache.get(username);
  if (cached && Date.now() < cached.expiresAt) return cached.data;

  const inFlight = postFetchInFlight.get(username);
  if (inFlight) return inFlight;

  return [];
}
