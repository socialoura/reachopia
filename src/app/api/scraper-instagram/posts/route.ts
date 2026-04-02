/* ═══════════════════════════════════════════════════════════════
   GET /api/scraper-instagram/posts?username=xxx
   Returns cached Instagram posts or waits for background fetch.
   ═══════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from "next/server";
import { getPosts, isRateLimited } from "../shared";

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const username = req.nextUrl.searchParams.get("username")?.replace(/^@/, "").trim().toLowerCase();
    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }

    const posts = await getPosts(username);
    if (!posts || posts.length === 0) {
      return NextResponse.json({ error: "Posts not found" }, { status: 404 });
    }

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("[scraper-instagram/posts] Error:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
