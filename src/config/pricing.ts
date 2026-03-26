/* ═══════════════════════════════════════════════════════════════
   Pricing Configuration — Multi-currency + Downsell
   Admin-ready structure: can be replaced by DB calls later.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Supported currencies ─── */
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];
export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export const CURRENCY_MAP: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: "USD", symbol: "$",   label: "US Dollar" },
  EUR: { code: "EUR", symbol: "€",   label: "Euro" },
  GBP: { code: "GBP", symbol: "£",   label: "British Pound" },
  CAD: { code: "CAD", symbol: "CA$", label: "Canadian Dollar" },
  AUD: { code: "AUD", symbol: "AU$", label: "Australian Dollar" },
};

/* ─── Downsell config ─── */
export interface DownsellConfig {
  reachAmount: number;
  price: number;
  currency: string;
  ctaLabel: string;
  enabled: boolean;
}

export const downsellConfig: DownsellConfig = {
  reachAmount: 100,
  price: 1.90,
  currency: "$",
  ctaLabel: "Claim My Trial Pack",
  enabled: true,
};

/* ─── Social proof names for rotating notifications ─── */
export const SOCIAL_PROOF_NAMES = [
  "Alex", "Sarah", "Mike", "Emma", "Lucas", "Olivia",
  "Noah", "Sophia", "Liam", "Isabella", "James", "Mia",
  "Ethan", "Ava", "Daniel", "Charlotte", "Mason", "Amelia",
  "Logan", "Harper", "Léa", "Théo", "Jade", "Hugo",
];
