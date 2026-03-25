import { NextRequest, NextResponse } from "next/server";
import { getOrderStats, verifyAdminToken, extractToken } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    if (!verifyAdminToken(extractToken(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getOrderStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[Admin Stats]", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
