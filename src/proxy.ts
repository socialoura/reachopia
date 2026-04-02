import { NextResponse, type NextRequest } from "next/server";

/* ═══════════════════════════════════════════════════════════════
   Middleware — Geo-based currency detection
   Sets a `user_currency` cookie based on the visitor's country.
   ═══════════════════════════════════════════════════════════════ */

const EUR_COUNTRIES = [
  "FR", "DE", "IT", "ES", "PT", "NL", "BE", "AT", "IE", "FI",
  "GR", "LU", "SK", "SI", "EE", "LV", "LT", "CY", "MT", "HR",
];

function countryToCurrency(country: string | undefined | null): string {
  if (!country) return "USD";
  const code = country.toUpperCase();
  if (EUR_COUNTRIES.includes(code)) return "EUR";
  if (code === "GB") return "GBP";
  if (code === "CA") return "CAD";
  if (code === "AU") return "AUD";
  return "USD";
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Skip if user already has a currency cookie (don't overwrite manual choice)
  if (request.cookies.get("user_currency")) {
    return response;
  }

  // Detect country from Vercel headers
  const country = request.headers.get("x-vercel-ip-country") ?? null;

  const currency = countryToCurrency(country);

  // Set cookie — accessible by both Server and Client Components
  response.cookies.set("user_currency", currency, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: [
    // Run on all pages except static assets and API routes
    "/((?!_next/static|_next/image|favicon\\.ico|api/).*)",
  ],
};
