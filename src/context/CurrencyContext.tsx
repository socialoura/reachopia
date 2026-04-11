/* ═══════════════════════════════════════════════════════════════
   CurrencyContext — Global currency state from geo-detected cookie.
   Reads `user_currency` cookie set by middleware.ts.
   Exposes currency code, symbol, and a manual override function.
   SSR-safe: renders with default currency until hydrated.
   ═══════════════════════════════════════════════════════════════ */

"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import {
  CURRENCY_MAP,
  DEFAULT_CURRENCY,
  type CurrencyCode,
  type CurrencyInfo,
} from "@/config/pricing";

interface CurrencyContextValue {
  currency: CurrencyCode;
  symbol: string;
  info: CurrencyInfo;
  setCurrency: (code: CurrencyCode) => void;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: DEFAULT_CURRENCY,
  symbol: CURRENCY_MAP[DEFAULT_CURRENCY].symbol,
  info: CURRENCY_MAP[DEFAULT_CURRENCY],
  setCurrency: () => {},
});

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCurrencySymbolSafe(code: string): string {
  try {
    return (0).toLocaleString("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).replace(/[0-9\s]/g, "").trim() || code;
  } catch {
    return code;
  }
}

function isValidCurrency(code: string | null): code is string {
  // Accept any 3-letter uppercase currency code (Stripe validates at payment time)
  return code !== null && /^[A-Z]{3}$/.test(code);
}

function CurrencyProviderInner({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const searchParams = useSearchParams();

  // Priority 1: Read currency from URL parameter (for Google Ads campaigns)
  // Priority 2: Read from cookie (geo-detected or previously set)
  useEffect(() => {
    const urlCurrency = searchParams.get("currency")?.toUpperCase();
    
    // If URL has valid currency param, use it and persist to cookie
    if (urlCurrency && isValidCurrency(urlCurrency)) {
      setCurrencyState(urlCurrency);
      setCookie("user_currency", urlCurrency, 30);
      return;
    }
    
    // Otherwise, fall back to cookie
    const saved = getCookie("user_currency");
    if (isValidCurrency(saved)) {
      setCurrencyState(saved);
    }
  }, [searchParams]);

  // Manual override: update state + persist to cookie
  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    setCookie("user_currency", code, 30);
  }, []);

  // Look up display info; generate dynamically for currencies not in CURRENCY_MAP
  const info: CurrencyInfo = CURRENCY_MAP[currency] ?? {
    code: currency,
    symbol: getCurrencySymbolSafe(currency),
    label: currency,
  };

  return (
    <CurrencyContext.Provider value={{ currency, symbol: info.symbol, info, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  return (
    <CurrencyProviderInner>{children}</CurrencyProviderInner>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
