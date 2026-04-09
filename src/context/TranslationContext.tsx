"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCurrency } from "@/context/CurrencyContext";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import de from "@/locales/de.json";
import es from "@/locales/es.json";
import pt from "@/locales/pt.json";

type Locale = "en" | "fr" | "de" | "es" | "pt";
type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, fr, de, es, pt };

const SUPPORTED_LOCALES: Locale[] = ["en", "fr", "de", "es", "pt"];
function isLocale(v: string | null): v is Locale {
  return SUPPORTED_LOCALES.includes(v as Locale);
}

const LS_KEY = "vpx_lang";

/**
 * Resolve a dot-notation key like "home.heroTitle1" from a nested JSON object.
 */
function resolve(obj: Record<string, unknown>, path: string): string {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : path;
}

interface TranslationContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const TranslationContext = createContext<TranslationContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key, replacements) => {
    let value = resolve(en as unknown as Record<string, unknown>, key);
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }
    return value;
  },
});

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Always start with "en" to match SSR — real locale is resolved in useEffect
  const [locale, setLocaleState] = useState<Locale>("en");

  // Resolve real locale on mount + sync from URL param changes
  useEffect(() => {
    const urlLang = searchParams.get("lang");
    if (isLocale(urlLang)) {
      setLocaleState(urlLang);
      try { localStorage.setItem(LS_KEY, urlLang); } catch {}
      return;
    }
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (isLocale(stored)) {
        setLocaleState(stored);
        return;
      }
    } catch {}
  }, [searchParams]);

  // Auto-switch currency to EUR for fr/de/es locales
  const { setCurrency } = useCurrency();
  useEffect(() => {
    if (locale === "fr" || locale === "de" || locale === "es") {
      setCurrency("EUR");
    }
  }, [locale, setCurrency]);

  // Update <html lang="..."> attribute
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem(LS_KEY, l); } catch {}

    // Update URL param
    const params = new URLSearchParams(window.location.search);
    if (l === "en") {
      params.delete("lang");
    } else {
      params.set("lang", l);
    }
    const qs = params.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [pathname, router]);

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    let value = resolve(dictionaries[locale] as unknown as Record<string, unknown>, key);
    // Fallback to English if key not found in current locale
    if (value === key) {
      value = resolve(dictionaries.en as unknown as Record<string, unknown>, key);
    }
    // Apply replacements like {pct}
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }
    return value;
  }, [locale]);

  const contextValue = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}
