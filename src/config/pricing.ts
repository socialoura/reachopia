/* ═══════════════════════════════════════════════════════════════
   Pricing Configuration — Multi-currency + Downsell
   Admin-ready structure: can be replaced by DB calls later.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Currencies with manually defined prices (admin panel) ─── */
export const MANUAL_CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"] as const;
export type ManualCurrencyCode = (typeof MANUAL_CURRENCIES)[number];

/* ─── All currencies we support (manual + auto-converted) ─── */
export const ALL_CURRENCIES = [
  ...MANUAL_CURRENCIES,
  "CHF", "NZD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "RON", "BGN",
  "TRY", "BRL", "MXN", "ZAR", "INR", "SGD", "HKD", "THB", "PHP", "IDR",
  "MYR", "ILS", "JPY", "KRW", "VND", "CLP", "COP", "AED", "SAR", "QAR", "KWD",
] as const;
export type CurrencyCode = string; // Accept any Stripe currency code
export const DEFAULT_CURRENCY = "USD";

/** Backward-compatible alias */
export const SUPPORTED_CURRENCIES = ALL_CURRENCIES;

export interface CurrencyInfo {
  code: string;
  symbol: string;
  label: string;
}

/** Core display info for the 5 manual currencies (used by admin/switcher) */
export const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  USD: { code: "USD", symbol: "$",    label: "US Dollar" },
  EUR: { code: "EUR", symbol: "€",    label: "Euro" },
  GBP: { code: "GBP", symbol: "£",    label: "British Pound" },
  CAD: { code: "CAD", symbol: "CA$",  label: "Canadian Dollar" },
  AUD: { code: "AUD", symbol: "AU$",  label: "Australian Dollar" },
  CHF: { code: "CHF", symbol: "CHF",  label: "Swiss Franc" },
  NZD: { code: "NZD", symbol: "NZ$",  label: "New Zealand Dollar" },
  SEK: { code: "SEK", symbol: "kr",   label: "Swedish Krona" },
  NOK: { code: "NOK", symbol: "kr",   label: "Norwegian Krone" },
  DKK: { code: "DKK", symbol: "kr",   label: "Danish Krone" },
  PLN: { code: "PLN", symbol: "zł",   label: "Polish Zloty" },
  CZK: { code: "CZK", symbol: "Kč",   label: "Czech Koruna" },
  BRL: { code: "BRL", symbol: "R$",   label: "Brazilian Real" },
  MXN: { code: "MXN", symbol: "MX$",  label: "Mexican Peso" },
  INR: { code: "INR", symbol: "₹",    label: "Indian Rupee" },
  JPY: { code: "JPY", symbol: "¥",    label: "Japanese Yen" },
  KRW: { code: "KRW", symbol: "₩",    label: "South Korean Won" },
  SGD: { code: "SGD", symbol: "S$",   label: "Singapore Dollar" },
  HKD: { code: "HKD", symbol: "HK$",  label: "Hong Kong Dollar" },
  THB: { code: "THB", symbol: "฿",    label: "Thai Baht" },
  AED: { code: "AED", symbol: "د.إ",  label: "UAE Dirham" },
  SAR: { code: "SAR", symbol: "﷼",    label: "Saudi Riyal" },
  ZAR: { code: "ZAR", symbol: "R",    label: "South African Rand" },
  TRY: { code: "TRY", symbol: "₺",    label: "Turkish Lira" },
};

/* ─── Downsell config ─── */
export interface DownsellConfig {
  reachAmount: number;
  price: number;
  currency: string;
  ctaLabel: string;
  enabled: boolean;
  prices?: Record<string, number>;
}

export const downsellConfig: DownsellConfig = {
  reachAmount: 100,
  price: 1.90,
  currency: "$",
  ctaLabel: "Claim My Trial Pack",
  enabled: true,
  prices: { USD: 1.90, EUR: 1.90, GBP: 1.50, CAD: 2.50, AUD: 2.90 },
};

/* ─── Social proof names for rotating notifications ─── */
export const SOCIAL_PROOF_NAMES = [
  "Alex", "Sarah", "Mike", "Emma", "Lucas", "Olivia",
  "Noah", "Sophia", "Liam", "Isabella", "James", "Mia",
  "Ethan", "Ava", "Daniel", "Charlotte", "Mason", "Amelia",
  "Logan", "Harper", "Léa", "Théo", "Jade", "Hugo",
];
