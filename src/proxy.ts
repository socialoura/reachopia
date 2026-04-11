import { NextResponse, type NextRequest } from "next/server";

/* ═══════════════════════════════════════════════════════════════
   Proxy — Geo-based currency detection (Next.js 16 convention)
   Reads the visitor's country from Vercel edge headers and sets
   a `user_currency` cookie so the CurrencyContext picks it up.
   ═══════════════════════════════════════════════════════════════ */

const EUR_COUNTRIES = new Set([
  "FR", "DE", "IT", "ES", "PT", "NL", "BE", "AT", "IE", "FI",
  "GR", "LU", "SK", "SI", "EE", "LV", "LT", "CY", "MT", "HR",
]);

// European countries NOT in eurozone → show EUR (most familiar non-local)
const EUR_ADJACENT = new Set([
  "PL", "CZ", "RO", "HU", "BG", "SE", "DK", "NO", "IS",
  "BA", "RS", "AL", "ME", "MK",
]);

// Direct country → currency mapping for non-EUR/USD markets
const COUNTRY_CURRENCY: Record<string, string> = {
  GB: "GBP",
  CA: "CAD",
  AU: "AUD",
  NZ: "NZD",
  CH: "CHF",
  BR: "BRL",
  MX: "MXN",
  IN: "INR",
  JP: "JPY",
  KR: "KRW",
  SG: "SGD",
  HK: "HKD",
  TH: "THB",
  PH: "PHP",
  ID: "IDR",
  MY: "MYR",
  VN: "VND",
  ZA: "ZAR",
  IL: "ILS",
  TR: "TRY",
  AE: "AED",
  SA: "SAR",
  QA: "QAR",
  KW: "KWD",
  CL: "CLP",
  CO: "COP",
  PE: "PEN",
  AR: "ARS",
};

function countryToCurrency(country: string | undefined | null): string {
  if (!country) return "USD";
  const code = country.toUpperCase();
  if (EUR_COUNTRIES.has(code)) return "EUR";
  if (EUR_ADJACENT.has(code)) return "EUR";
  if (COUNTRY_CURRENCY[code]) return COUNTRY_CURRENCY[code];
  return "USD";
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Skip if user already has a currency cookie (don't overwrite manual choice or URL override)
  if (request.cookies.get("user_currency")) {
    return response;
  }

  // Detect country from Vercel/Cloudflare edge headers
  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    null;

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
    // Run on all page requests, skip static assets, images, favicon, and API routes
    "/((?!_next/static|_next/image|favicon\\.ico|api/).*)",
  ],
};
