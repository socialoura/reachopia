"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ChevronDown,
  Zap,
  Star,
  Sparkles,
  Search,
  X,
  ArrowRight,
  TrendingUp,
  Flame,
} from "lucide-react";
import CheckoutModal from "@/components/ui/CheckoutModal";
import type { CheckoutTier } from "@/components/ui/CheckoutModal";
import { toCheckoutTiers } from "@/lib/pricing-utils";
import UserProfileBadge from "@/components/UserProfileBadge";
import { useSocialProfile } from "@/hooks/useSocialProfile";
import { downsellConfig as defaultDownsellConfig, SOCIAL_PROOF_NAMES } from "@/config/pricing";
import { useCurrency } from "@/context/CurrencyContext";
import { usePostHog } from "posthog-js/react";

/* ─── Custom Icons ─── */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.6 5.82A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  );
}

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

/* ─── Platform type ─── */
type Platform = "instagram" | "tiktok";

/* ─── Scanning messages (no commercial keywords) ─── */
const SCAN_MESSAGES = [
  "Scanning audience signals…",
  "Calculating AI reach potential…",
  "Mapping growth vectors…",
  "Generating personalized campaign…",
];

/* ─── Accent helpers ─── */
const IG_ACCENT = "#dd2a7b";
const IG_GRADIENT = "linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)";
const TT_ACCENT = "#ee1d52";
const TT_GRADIENT = "linear-gradient(135deg, #69C9D0 0%, #ee1d52 100%)";

function getAccent(p: Platform) {
  return p === "instagram"
    ? { primary: IG_ACCENT, gradient: IG_GRADIENT, tw: "from-[#f58529] via-[#dd2a7b] to-[#8134af]" }
    : { primary: TT_ACCENT, gradient: TT_GRADIENT, tw: "from-[#69C9D0] to-[#ee1d52]" };
}

/* ─── FAQ Data ─── */
const faqs = [
  {
    q: "How does the AI analysis work?",
    a: "Our proprietary engine scans your public profile, content category, and audience signals to identify the optimal growth strategy for your niche. The entire process takes seconds and requires zero credentials.",
  },
  {
    q: "Is my account safe?",
    a: "Absolutely. We never ask for passwords or login credentials — only your public username. Our methods are 100% compliant with platform guidelines and use organic audience targeting exclusively.",
  },
  {
    q: "Are there recurring charges?",
    a: "No. Every campaign is a one-time payment. There are no hidden fees, subscriptions, or auto-renewals.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards (Visa, Mastercard, Amex), Apple Pay, and Google Pay — processed securely through Stripe with bank-grade encryption.",
  },
  {
    q: "How fast will I see results?",
    a: "Most campaigns begin delivering measurable momentum within minutes. Full deployment completes within 24-72 hours with gradual, algorithm-friendly delivery.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes. Every campaign is backed by our Results Guarantee. If we can't deliver, you receive a full refund — no questions asked.",
  },
];

/* ─── FAQ Accordion ─── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full py-6 text-left gap-4">
        <span className="text-[15px] font-medium text-white">{q}</span>
        <ChevronDown className={`w-5 h-5 text-zinc-500 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] as const }}
        className="overflow-hidden"
      >
        <p className="pb-6 text-[14px] text-zinc-400 leading-relaxed">{a}</p>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ENGAGEMENT TUNNEL PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function GrowthAnalyzerPage() {
  const posthog = usePostHog();
  const { currency, symbol: currencySymbol } = useCurrency();
  /* ── Tunnel state: "input" → "scanning" → "results" ── */
  const [step, setStep] = useState<"input" | "scanning" | "results">("input");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [username, setUsername] = useState("");
  const [scanMsg, setScanMsg] = useState(SCAN_MESSAGES[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Results state (only populated after scan) ── */
  const [tiers, setTiers] = useState<CheckoutTier[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<CheckoutTier | null>(null);
  const [downsellData, setDownsellData] = useState(defaultDownsellConfig);

  const accent = getAccent(platform);

  /* ── Scanning animation: rotate messages every ~800ms ── */
  useEffect(() => {
    if (step !== "scanning") return;
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      if (i < SCAN_MESSAGES.length) {
        setScanMsg(SCAN_MESSAGES[i]);
      } else {
        clearInterval(interval);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [step]);

  /* ── Fetch data + transition to results after scan delay ── */
  const startAnalysis = useCallback(() => {
    const clean = username.replace(/^@/, "").trim();
    if (!clean) {
      inputRef.current?.focus();
      return;
    }
    setUsername(clean);
    setStep("scanning");
    setScanMsg(SCAN_MESSAGES[0]);

    posthog?.capture("analyze_profile_started", { username: clean, network: platform });
    posthog?.people?.set({ username: clean });

    /* Fetch tiers + downsell + social profile in parallel with the scanning animation */
    const fetchTiers = fetch("/api/pricing")
      .then((r) => r.json())
      .then((data) => {
        // Store downsell config from DB if available
        if (data.downsell) {
          setDownsellData(data.downsell);
        }
        const raw = platform === "instagram" ? data.instagram : data.tiktok;
        return raw ? toCheckoutTiers(raw, currency) : [];
      })
      .catch(() => [] as CheckoutTier[]);

    // Pre-warm social profile cache so badge loads instantly in the modal
    fetch(`/api/social-profile?username=${encodeURIComponent(clean)}&platform=${platform}`).catch(() => {});

    /* Wait at least 2.8s (UX) + until data arrives */
    const timerPromise = new Promise((r) => setTimeout(r, 2800));

    Promise.all([fetchTiers, timerPromise]).then(([fetched]) => {
      setTiers(fetched as CheckoutTier[]);
      setStep("results");
      posthog?.capture("pricing_displayed", { network: platform });
    });
  }, [username, platform, currency]);

  /* ── Handle Enter key ── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") startAnalysis();
  };

  /* ── Close results & reset ── */
  const closeResults = () => {
    setStep("input");
    setTiers([]);
    setSelectedTier(null);
  };

  const handleSelectTier = (tier: CheckoutTier) => {
    posthog?.capture("package_selected", { volume: tier.volume, price: tier.price, network: platform });
    setSelectedTier(tier);
    setCheckoutOpen(true);
  };

  return (
    <>
      {/* ───────────── HERO: INPUT FORM ───────────── */}
      <section className="relative min-h-[100dvh] flex items-center justify-center bg-black overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[160px] opacity-30 transition-colors duration-700" style={{ backgroundColor: accent.primary }} />
        </div>

        <div className="relative max-w-2xl mx-auto px-5 sm:px-8 w-full text-center">
          <AnimatePresence mode="wait">
            {/* ── STEP 1: Username Input ── */}
            {step === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm mb-8">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[12px] font-medium text-zinc-300">AI-Powered Growth Engine</span>
                </div>

                <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold text-white tracking-tight leading-[1.1]">
                  Calculate Your{" "}
                  <span className="bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: accent.gradient }}>
                    AI Growth Potential
                  </span>
                </h1>

                <p className="mt-5 text-[15px] sm:text-[17px] text-zinc-400 leading-relaxed max-w-md mx-auto">
                  Enter your username and our AI will analyze your account to build a personalized growth strategy.
                </p>

                {/* Platform toggle */}
                <div className="mt-10 inline-flex items-center p-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                  <button
                    onClick={() => setPlatform("instagram")}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 ${
                      platform === "instagram" ? "bg-white text-black shadow-lg" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <InstagramIcon className="w-4 h-4" />
                    Instagram
                  </button>
                  <button
                    onClick={() => setPlatform("tiktok")}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 ${
                      platform === "tiktok" ? "bg-white text-black shadow-lg" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <TikTokIcon className="w-4 h-4" />
                    TikTok
                  </button>
                </div>

                {/* Username input */}
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto">
                  <div className="relative w-full">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-[15px] font-medium select-none">@</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter your username"
                      className="w-full pl-9 pr-4 py-4 rounded-2xl bg-white/[0.06] border border-white/[0.08] text-white text-[15px] placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.2] focus:bg-white/[0.08] transition-all duration-300"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                  <button
                    onClick={startAnalysis}
                    className="shine w-full sm:w-auto whitespace-nowrap inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-white text-[14px] font-semibold transition-all duration-300 hover:opacity-90 active:scale-[0.97]"
                    style={{ background: accent.gradient }}
                  >
                    <Search className="w-4 h-4" />
                    Analyze Account
                  </button>
                </div>

                {/* Trust badges */}
                <div className="mt-6 flex items-center justify-center gap-5 text-[11px] text-zinc-600">
                  <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> 100% secure</span>
                  <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Instant analysis</span>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Scanning Animation ── */}
            {step === "scanning" && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-8"
              >
                {/* Animated orb */}
                <div className="relative w-28 h-28">
                  <div className="absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse" style={{ backgroundColor: accent.primary }} />
                  <div className="absolute inset-2 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: accent.primary, animationDuration: "1.2s" }} />
                  <div className="absolute inset-4 rounded-full border-2 border-transparent animate-spin" style={{ borderBottomColor: accent.primary, animationDuration: "1.8s", animationDirection: "reverse" }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Search className="w-7 h-7 text-white/60" />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[13px] text-zinc-500 mb-2">Analyzing <span className="text-white font-medium">@{username}</span></p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={scanMsg}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-[17px] font-medium text-white"
                    >
                      {scanMsg}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Progress bar */}
                <div className="w-64 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.8, ease: "linear" }}
                    className="h-full rounded-full"
                    style={{ background: accent.gradient }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ───────────── RESULTS MODAL (strict conditional render) ───────────── */}
      {step === "results" && (
        <ResultsModal
          username={username}
          platform={platform}
          tiers={tiers}
          accent={accent}
          onSelectTier={handleSelectTier}
          onClose={closeResults}
          downsell={downsellData}
          currencySymbol={currencySymbol}
          currency={currency}
        />
      )}

      {/* ───────────── GUARANTEES ───────────── */}
      <section className="py-24 md:py-32 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">
              Every Campaign Includes
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              Peace of Mind, Built In
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Shield, title: "Results Guarantee", desc: "Full refund if we don't deliver. No questions asked." },
              { icon: Zap, title: "Instant Activation", desc: "Campaigns begin within minutes. No waiting." },
              { icon: Star, title: "Premium Support", desc: "24/7 support via email and live chat at every tier." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="rounded-2xl p-7 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `${accent.primary}15` }}>
                  <item.icon className="w-5 h-5" style={{ color: accent.primary }} />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-1.5 tracking-tight">{item.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="py-24 md:py-32 bg-black">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">
              FAQ
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              Common Questions
            </motion.h2>
          </motion.div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.06] px-6 sm:px-8">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Checkout (strict conditional render) ── */}
      {selectedTier && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          platform={platform}
          tier={selectedTier}
          accentColor={accent.primary}
          accentGradient={accent.gradient}
          username={username}
          currencySymbol={currencySymbol}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS — Number formatting & parsing
   ═══════════════════════════════════════════════════════════════ */
function formatProjection(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toLocaleString("en-US");
}

/** Parse "50,000" or "50000" → 50000 */
function parseVolume(v: string): number {
  return parseInt(v.replace(/,/g, ""), 10) || 0;
}

/* ═══════════════════════════════════════════════════════════════
   SOCIAL PROOF — Rotating fake purchase notifications
   ═══════════════════════════════════════════════════════════════ */
function useSocialProof(platform: Platform) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % SOCIAL_PROOF_NAMES.length);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const name = SOCIAL_PROOF_NAMES[index];
  const plat = platform === "instagram" ? "Instagram" : "TikTok";
  return { name, platform: plat, key: `${name}-${index}` };
}

function SocialProofBanner({ platform }: { platform: Platform }) {
  const { name, platform: platLabel, key } = useSocialProof(platform);
  return (
    <div className="flex justify-center mb-5">
      <div className="relative overflow-hidden h-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]"
          >
            <Flame className="w-3 h-3 text-orange-400" />
            <span className="text-[11px] text-zinc-400">
              <span className="font-semibold text-zinc-300">{name}</span> just activated a Growth campaign on {platLabel}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RESULTS MODAL — Injected into DOM only after scan completes
   Features:
   1. Projection "Before → After" on each tier card
   2. Rotating social proof notifications
   3. Exit-intent downsell (admin-configurable)
   ═══════════════════════════════════════════════════════════════ */
function ResultsModal({
  username,
  platform,
  tiers,
  accent,
  onSelectTier,
  onClose,
  downsell,
  currencySymbol,
  currency,
}: {
  username: string;
  platform: Platform;
  tiers: CheckoutTier[];
  accent: { primary: string; gradient: string; tw: string };
  onSelectTier: (t: CheckoutTier) => void;
  onClose: () => void;
  downsell: import("@/config/pricing").DownsellConfig;
  currencySymbol: string;
  currency: string;
}) {
  const posthog = usePostHog();
  const [showDownsell, setShowDownsell] = useState(false);
  const downsellPrice = downsell.prices?.[currency] ?? downsell.price;
  const { profile } = useSocialProfile(username, platform);
  const followersCount = profile?.followersCount ?? null;

  /* ── Exit-intent: first close attempt → downsell (only if enabled) ── */
  const handleClose = () => {
    if (downsell.enabled && !showDownsell) {
      posthog?.capture("exit_intent_triggered", { network: platform, username });
      setShowDownsell(true);
    } else {
      posthog?.capture("exit_intent_dismissed", { network: platform, username });
      setShowDownsell(false);
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  /* ── Downsell: activate trial pack ── */
  const handleDownsellAccept = () => {
    posthog?.capture("exit_intent_accepted", {
      network: platform,
      username,
      downsell_price: downsellPrice,
      downsell_reach: downsell.reachAmount,
    });
    const trialTier: CheckoutTier = {
      label: `+${downsell.reachAmount}`,
      volume: downsell.reachAmount.toLocaleString("en-US"),
      price: downsellPrice,
      originalPrice: Math.round(downsellPrice * 2 * 100) / 100,
    };
    setShowDownsell(false);
    onSelectTier(trialTier);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
        className="relative w-full max-w-3xl max-h-[85dvh] flex flex-col rounded-3xl bg-zinc-950 border border-white/[0.08] overflow-hidden"
      >
        {/* Close button - sticky */}
        <button onClick={handleClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/[0.06] transition-colors text-zinc-500 hover:text-white z-20">
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <AnimatePresence mode="wait">
          {/* ════════════ DOWNSELL VIEW ════════════ */}
          {showDownsell ? (
            <motion.div
              key="downsell"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center text-center py-6"
            >
              <div className="text-[40px] mb-4">⚡</div>
              <h2 className="text-[clamp(1.2rem,3.5vw,1.7rem)] font-semibold text-white tracking-tight">
                Wait{" "}
                <span className="bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: accent.gradient }}>
                  @{username}
                </span>
                !
              </h2>
              <p className="mt-4 text-[15px] text-zinc-400 leading-relaxed max-w-sm mx-auto">
                Test our AI power with a <span className="font-semibold text-white">Trial Pack</span>.{" "}
                <span className="font-semibold text-white">+{downsell.reachAmount} Reach</span> for only{" "}
                <span className="font-bold text-white">{currencySymbol}{downsellPrice.toFixed(2)}</span>.
              </p>

              {followersCount != null && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <TrendingUp className="w-4 h-4" style={{ color: accent.primary }} />
                  <span className="text-[13px] text-zinc-400">
                    {formatProjection(followersCount)} → <span className="font-semibold text-white">{formatProjection(followersCount + downsell.reachAmount)}</span>
                  </span>
                </div>
              )}

              <button
                onClick={handleDownsellAccept}
                className="shine mt-8 w-full max-w-xs py-4 rounded-2xl text-[15px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
                style={{ background: accent.gradient }}
              >
                {downsell.ctaLabel || `Claim Trial — ${currencySymbol}${downsellPrice.toFixed(2)}`}
              </button>
              <button
                onClick={() => { setShowDownsell(false); onClose(); }}
                className="mt-3 text-[12px] text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                No thanks, I don&apos;t want to grow
              </button>
            </motion.div>
          ) : (
            /* ════════════ MAIN RESULTS VIEW ════════════ */
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col h-full overflow-hidden"
            >
              {/* Personalized header - sticky */}
              <div className="flex-shrink-0 flex flex-col items-center px-4 pt-4 pb-3 sm:px-8 sm:pt-6 sm:pb-4 bg-zinc-950">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3 sm:mb-4">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] sm:text-[12px] font-medium text-emerald-400">Analysis Complete</span>
                </div>

                {/* Live profile badge */}
                <div className="mb-3 sm:mb-4">
                  <UserProfileBadge username={username} platform={platform} showFollowers size="md" />
                </div>

                <h2 className="text-[1.1rem] sm:text-[1.5rem] lg:text-[2rem] font-semibold text-white tracking-tight text-center px-2">
                  Great news for{" "}
                  <span className="bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: accent.gradient }}>
                    @{username}
                  </span>
                  !
                </h2>
                <p className="mt-2 sm:mt-3 text-[12px] sm:text-[14px] lg:text-[15px] text-zinc-400 max-w-md mx-auto text-center px-2">
                  Our AI is ready to amplify your {platform === "instagram" ? "Instagram" : "TikTok"} followers. Choose your campaign budget below.
                </p>
              </div>


              {/* Tier cards - scrollable area */}
              <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-8 sm:py-4">
                {tiers.length === 0 ? (
                  <p className="text-center text-zinc-500 py-10">Campaign data unavailable. Please try again later.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {tiers.map((tier, i) => {
                    const isPopular = i === Math.min(3, tiers.length - 1);
                    const packAmount = parseVolume(tier.volume);
                    const projectedTotal = followersCount != null ? followersCount + packAmount : null;
                    return (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        onClick={() => onSelectTier(tier)}
                        className={`group relative rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 text-center border transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] ${
                          isPopular
                            ? "border-white/[0.15] bg-white/[0.05]"
                            : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]"
                        }`}
                        style={isPopular ? { borderColor: `${accent.primary}50`, boxShadow: `0 12px 40px -8px ${accent.primary}20` } : undefined}
                      >
                        {isPopular && (
                          <span className="absolute -top-2 sm:-top-2.5 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white whitespace-nowrap" style={{ background: accent.gradient }}>
                            Popular
                          </span>
                        )}
                        <span className="block text-[16px] sm:text-[20px] lg:text-[24px] font-semibold text-white tracking-tight">{tier.label}</span>
                        <span className="block mt-0.5 text-[8px] sm:text-[9px] font-medium" style={{ color: `${accent.primary}99` }}>AI Reach</span>
                        <span className="block mt-1 sm:mt-1.5 text-[15px] sm:text-[17px] font-semibold text-zinc-200 group-hover:text-white transition-colors">{currencySymbol}{tier.price.toFixed(2)}</span>
                        <span className="block text-[9px] sm:text-[10px] text-zinc-600 line-through">{currencySymbol}{tier.originalPrice.toFixed(2)}</span>

                        {/* Projection: You'll reach X followers */}
                        {projectedTotal != null && (
                          <div className="mt-1.5 sm:mt-2 px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-white/[0.03] border border-white/[0.06]">
                            <div className="text-[7px] sm:text-[8px] text-zinc-600 mb-0.5">You'll reach</div>
                            <div className="flex items-center justify-center gap-0.5">
                              <TrendingUp className="w-2 h-2 sm:w-2.5 sm:h-2.5" style={{ color: accent.primary }} />
                              <span className="text-[10px] sm:text-[12px] font-bold text-white truncate">{formatProjection(projectedTotal)} followers</span>
                            </div>
                          </div>
                        )}

                        <span className="mt-1 sm:mt-1.5 inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-medium" style={{ color: accent.primary }}>
                          Select <ArrowRight className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                        </span>
                      </motion.button>
                    );
                  })}
                  </div>
                )}
              </div>

              {/* Trust bar - sticky bottom */}
              <div className="flex-shrink-0 px-4 py-3 sm:px-8 sm:py-4 bg-zinc-950 border-t border-white/[0.06]">
                <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-[9px] sm:text-[10px] text-zinc-600">
                  <span className="flex items-center gap-0.5"><Shield className="w-2 h-2 sm:w-2.5 sm:h-2.5" /> Stripe secured</span>
                  <Image src="/badges_paiement.png" alt="Accepted payment methods" width={160} height={20} className="h-4 sm:h-5 w-auto object-contain opacity-60" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
