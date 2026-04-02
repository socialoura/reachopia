"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Shield,
  Zap,
  Search,
  TrendingUp,
  ChevronDown,
  Sparkles,
  Star,
  Users,
  Heart,
  Eye,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useCurrency } from "@/context/CurrencyContext";
import { useTiktokUpsellStore } from "@/store/useTiktokUpsellStore";
import { usePricingTiers } from "@/hooks/usePricingTiers";
import { formatCurrency } from "@/lib/currency";
import { formatQty } from "@/config/tiktok-services";
import ProfileSearchInput from "@/components/tiktok-upsell/ProfileSearchInput";
import ProfileCard from "@/components/tiktok-upsell/ProfileCard";
import BundleConfigurator from "@/components/tiktok-upsell/BundleConfigurator";
import VideoSelector from "@/components/tiktok-upsell/VideoSelector";
import OrderRecap from "@/components/tiktok-upsell/OrderRecap";
import BundleCheckoutModal from "@/components/tiktok-upsell/BundleCheckoutModal";
import { useIsMobile } from "@/hooks/useMediaQuery";

/* ─── TikTok Icon ─── */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.6 5.82A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  );
}

/* ─── Instagram Icon ─── */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

/* ─── Constants ─── */
const TT_ACCENT = "#ee1d52";
const TT_GRADIENT = "linear-gradient(135deg, #69C9D0 0%, #ee1d52 100%)";
const IG_ACCENT = "#dd2a7b";
const IG_GRADIENT = "linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)";

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

const noAnim = {
  hidden: { opacity: 1, y: 0 },
  visible: () => ({ opacity: 1, y: 0, transition: { duration: 0 } }),
};

/* ─── FAQ ─── */
const faqs = [
  {
    q: "How does the campaign work?",
    a: "After you configure your growth campaign and complete payment, our AI engine begins optimizing your profile's reach. Campaigns are distributed over 24-72 hours to ensure organic, algorithm-friendly growth.",
  },
  {
    q: "Is my account secure during the campaign?",
    a: "Yes. Our systems operate entirely externally. We never ask for your login details, ensuring your account remains 100% secure and under your full control.",
  },
  {
    q: "Can I prioritize specific content?",
    a: "Yes. After configuring your campaign goals, you can select which of your recent videos should receive prioritized promotion and amplification.",
  },
  {
    q: "What results can I expect?",
    a: "Our AI targets active, real users within your niche. Campaign delivery is paced gradually to match organic patterns. Some natural fluctuation over time is expected.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, Amex), Apple Pay, and Google Pay. All payments are processed securely through Stripe.",
  },
  {
    q: "What is your refund policy?",
    a: "If we are unable to deliver on the agreed campaign metrics, you will receive a full refund. Contact our support team if you experience any issues.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const posthog = usePostHog();
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => {
          if (!open) posthog?.capture("tiktok_faq_clicked", { question: q });
          setOpen(!open);
        }}
        className="flex items-center justify-between w-full py-6 text-left gap-4"
      >
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


/* ─── Step indicator ─── */
function StepIndicator({ currentStep }: { currentStep: string }) {
  const { platform } = useTiktokUpsellStore();
  const isIG = platform === "instagram";

  const steps = [
    { key: "bundle", label: "Configure", icon: Sparkles },
    { key: "assignLikes", label: "Likes", icon: Heart },
    { key: "assignViews", label: "Views", icon: Eye },
    { key: "recap", label: "Recap", icon: Star },
  ];

  // Only show when we're past the search/scanning phase
  const activeSteps = ["bundle", "assignLikes", "assignViews", "recap", "checkout"];
  if (!activeSteps.includes(currentStep)) return null;

  const currentIdx = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((s, i) => {
        const done = i < currentIdx;
        const active = s.key === currentStep;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                active
                  ? "bg-white/[0.1] text-white border border-white/[0.15]"
                  : done
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-white/[0.03] text-zinc-600 border border-white/[0.06]"
              }`}
            >
              <s.icon className="w-3 h-3" />
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-6 h-px ${done ? "bg-emerald-500/40" : "bg-white/[0.06]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function TikTokFollowersPage() {
  const posthog = usePostHog();
  const isMobile = useIsMobile();
  const v = isMobile ? noAnim : fadeUp;
  const { currency } = useCurrency();
  const hasTrackedRef = useRef(false);

  /* ─── Client-only gate: hide sensitive sections from SSR/crawlers ─── */
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const {
    step,
    platform,
    setPlatform,
    profile,
    profileError,
    username,
    followersQty,
    likesQty,
    viewsQty,
    setStep,
    setProfile,
    setFollowersQty,
    setLikesQty,
    setViewsQty,
    setCheckoutOpen,
    reset,
  } = useTiktokUpsellStore();

  const isIG = platform === "instagram";
  const accent = isIG ? IG_ACCENT : TT_ACCENT;
  const gradient = isIG ? IG_GRADIENT : TT_GRADIENT;

  const { getTierPrice: getPrice } = usePricingTiers(currency);

  /* Track page view once */
  useEffect(() => {
    if (!hasTrackedRef.current) {
      posthog?.capture("tiktok_landing_viewed", { referrer: document.referrer || "direct", variant: "pricing2" });
      hasTrackedRef.current = true;
    }
  }, []);

  /* ─── localStorage bundle persistence ─── */
  const LS_KEY = "vpx_tiktok_bundle";
  useEffect(() => {
    if (step === "search" || step === "scanning") return;
    if (!username) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        username, followersQty, likesQty, viewsQty, ts: Date.now(),
      }));
    } catch {}
  }, [username, followersQty, likesQty, viewsQty, step]);

  const didRestoreRef = useRef(false);
  useEffect(() => {
    if (didRestoreRef.current || step !== "search") return;
    didRestoreRef.current = true;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (Date.now() - saved.ts > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(LS_KEY);
        return;
      }
      if (saved.followersQty) setFollowersQty(saved.followersQty);
      if (saved.likesQty) setLikesQty(saved.likesQty);
      if (saved.viewsQty) setViewsQty(saved.viewsQty);
    } catch {}
  }, []);

  useEffect(() => {
    if (step === "checkout") {
      try { localStorage.removeItem(LS_KEY); } catch {}
    }
  }, [step]);

  /* ─── Skip recap for tiny orders ─── */
  const SKIP_RECAP_THRESHOLD = 10;
  const computedTotal = isIG
    ? getPrice("instagram", followersQty)
    : getPrice("tiktok", followersQty) + getPrice("tiktokLikes", likesQty) + getPrice("tiktokViews", viewsQty);

  /* ─── Lazy-load videos/posts in background while user configures bundle ─── */
  const videosFetchedRef = useRef(false);
  useEffect(() => {
    if (!profile?.username || videosFetchedRef.current) return;
    if (profile.posts.length > 0) return;

    videosFetchedRef.current = true;
    let cancelled = false;

    const pollUrl = isIG
      ? `/api/scraper-instagram/posts?username=${encodeURIComponent(profile.username)}`
      : `/api/scraper-tiktok/videos?username=${encodeURIComponent(profile.username)}`;

    const poll = async () => {
      for (let attempt = 0; attempt < 8; attempt++) {
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, attempt === 0 ? 1000 : 2000));
        if (cancelled) return;
        try {
          const res = await fetch(pollUrl);
          if (!res.ok) continue;
          const data = await res.json();
          if (data.posts && data.posts.length > 0) {
            setProfile({ ...profile, posts: data.posts });
            return;
          }
        } catch { /* retry */ }
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [profile?.username, isIG]);

  /* Scroll to top on step change */
  useEffect(() => {
    if (step !== "search" && step !== "scanning") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  const hasPosts = (profile?.posts?.length ?? 0) > 0;

  return (
    <>
      {/* ───────────── AMBIENT GLOW ───────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[20vh] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[180px] opacity-20 transition-colors duration-700" style={{ backgroundColor: accent }} />
      </div>

      {/* ───────────── HERO / MAIN FLOW ───────────── */}
      <section className={`relative z-10 overflow-hidden ${
        step === "search" || step === "scanning"
          ? "min-h-[100dvh] flex items-center justify-center pt-0 md:pt-0 -mt-16 md:mt-0"
          : "pt-8 md:pt-12 pb-16"
      }`}>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-8 w-full">
          <AnimatePresence mode="wait">
            {/* ══════════ SEARCH + SCANNING ══════════ */}
            {(step === "search" || step === "scanning") && (
              <motion.div
                key="search"
                initial={isMobile ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                className="text-center"
              >
                {/* ─── Platform Switcher ─── */}
                <div className="inline-flex items-center rounded-full bg-white/[0.06] border border-white/[0.08] p-1 mb-8">
                  {(["tiktok", "instagram"] as const).map((p) => {
                    const active = platform === p;
                    return (
                      <button
                        key={p}
                        onClick={() => { if (!active) { reset(); setPlatform(p); } }}
                        className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-[12px] font-medium transition-all duration-300 ${
                          active
                            ? "text-white shadow-lg"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                        style={active ? { background: p === "instagram" ? IG_GRADIENT : TT_GRADIENT } : undefined}
                      >
                        {p === "tiktok" ? <TikTokIcon className="w-3.5 h-3.5" /> : <InstagramIcon className="w-3.5 h-3.5" />}
                        {p === "tiktok" ? "TikTok" : "Instagram"}
                      </button>
                    );
                  })}
                </div>

                <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold text-white tracking-tight leading-[1.1]">
                  Amplify your{" "}
                  <span className={`bg-gradient-to-r ${isIG ? "from-[#f58529] via-[#dd2a7b] to-[#8134af]" : "from-[#69C9D0] to-[#ee1d52]"} bg-clip-text text-transparent`}>
                    {isIG ? "Instagram" : "TikTok"}
                  </span>
                  {" "}presence
                </h1>

                {mounted && (
                  <p data-nosnippet="" className="mt-5 text-[15px] sm:text-[17px] text-zinc-400 leading-relaxed max-w-lg mx-auto">
                    {isIG
                      ? "Launch AI-driven growth campaigns to boost your Instagram reach and visibility. Select your target audience size, highlight your best content, and let our proprietary engine do the rest."
                      : "Launch AI-driven growth campaigns to boost your profile's reach and visibility. Select your target audience size, highlight your best content, and let our proprietary engine do the rest."
                    }
                  </p>
                )}

                <div className="mt-10">
                  <ProfileSearchInput />
                </div>

                {profileError && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-[13px] text-red-400">
                    {profileError}
                  </motion.p>
                )}

                <div className="mt-6 flex items-center justify-center flex-wrap gap-x-5 gap-y-2 text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> Privacy-First Approach</span>
                  <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Algorithmic Pacing</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> 100% Secure Checkout</span>
                </div>
              </motion.div>
            )}

            {/* ══════════ BUNDLE CONFIGURATOR ══════════ */}
            {step === "bundle" && profile && (
              <motion.div
                key="bundle"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <button onClick={reset} className="mb-4 text-[13px] text-zinc-500 hover:text-white transition-colors">
                  &larr; Search another profile
                </button>

                {/* Mini profile */}
                <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <ProfileCard />
                </div>

                <StepIndicator currentStep={step} />
                <BundleConfigurator />
              </motion.div>
            )}

            {/* ══════════ ASSIGN LIKES ══════════ */}
            {step === "assignLikes" && profile && (
              <motion.div
                key="assignLikes"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <StepIndicator currentStep={step} />
                <VideoSelector
                  mode="likes"
                  totalQty={likesQty}
                  onBack={() => setStep("bundle")}
                  onContinue={() => {
                    if (viewsQty > 0 && hasPosts) {
                      setStep("assignViews");
                    } else if (computedTotal < SKIP_RECAP_THRESHOLD) {
                      setStep("checkout");
                      setCheckoutOpen(true);
                    } else {
                      setStep("recap");
                    }
                  }}
                />
              </motion.div>
            )}

            {/* ══════════ ASSIGN VIEWS ══════════ */}
            {step === "assignViews" && profile && (
              <motion.div
                key="assignViews"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <StepIndicator currentStep={step} />
                <VideoSelector
                  mode="views"
                  totalQty={viewsQty}
                  onBack={() => {
                    if (likesQty > 0 && hasPosts) {
                      setStep("assignLikes");
                    } else {
                      setStep("bundle");
                    }
                  }}
                  onContinue={() => {
                    if (computedTotal < SKIP_RECAP_THRESHOLD) {
                      setStep("checkout");
                      setCheckoutOpen(true);
                    } else {
                      setStep("recap");
                    }
                  }}
                />
              </motion.div>
            )}

            {/* ══════════ RECAP ══════════ */}
            {(step === "recap" || step === "checkout") && profile && (
              <motion.div
                key="recap"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <StepIndicator currentStep="recap" />
                <OrderRecap
                  onBack={() => {
                    if (viewsQty > 0 && hasPosts) {
                      setStep("assignViews");
                    } else if (likesQty > 0 && hasPosts) {
                      setStep("assignLikes");
                    } else {
                      setStep("bundle");
                    }
                  }}
                />

                {/* Trust bar */}
                <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                    <Shield className="w-3 h-3" />
                    <span>Stripe secured</span>
                  </div>
                  <Image
                    src="/badges_paiement.png"
                    alt="Accepted payment methods"
                    width={160}
                    height={20}
                    className="h-5 w-auto object-contain opacity-60"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ───────────── BELOW-THE-FOLD: hidden from SSR / crawlers, only on search step ───────────── */}
      {mounted && (step === "search" || step === "scanning") && <div data-nosnippet="">
      <section className="relative z-10 py-16 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-14">
            <motion.p variants={v} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">
              How It Works
            </motion.p>
            <motion.h2 variants={v} custom={1} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              {isIG ? "4 Simple Steps to Amplify Your Instagram" : "4 Simple Steps to Amplify Your TikTok"}
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6">
            {(isIG
              ? [
                  { step: "01", icon: Search, title: "Find Your Profile", desc: "Enter your public Instagram handle. Our engine will analyze your profile to prepare the campaign." },
                  { step: "02", icon: Sparkles, title: "Select Your Campaign Size", desc: "Choose your growth goals and expected reach. Combine profile promotion with targeted content amplification." },
                  { step: "03", icon: Heart, title: "Highlight Specific Content", desc: "Select which of your posts should receive prioritized promotion and algorithmic boosting." },
                  { step: "04", icon: TrendingUp, title: "Launch & Scale", desc: "Pay securely via Stripe. Your AI-driven campaign begins shortly and optimizes over 24-72 hours." },
                ]
              : [
                  { step: "01", icon: Search, title: "Find Your Profile", desc: "Enter your public TikTok handle. Our engine will analyze your profile to prepare the campaign." },
                  { step: "02", icon: Sparkles, title: "Select Your Campaign Size", desc: "Choose your growth goals and expected reach. Combine profile promotion with targeted content amplification." },
                  { step: "03", icon: Heart, title: "Highlight Specific Content", desc: "Select which of your videos should receive prioritized promotion and algorithmic boosting." },
                  { step: "04", icon: TrendingUp, title: "Launch & Scale", desc: "Pay securely via Stripe. Your AI-driven campaign begins shortly and optimizes over 24-72 hours." },
                ]
            ).map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={v}
                custom={i}
                className="relative rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 group"
              >
                <span className="absolute top-4 right-4 text-[40px] font-black leading-none text-white/[0.03] group-hover:text-white/[0.06] transition-colors">{item.step}</span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `${accent}12` }}>
                  <item.icon className="w-5 h-5" style={{ color: accent }} />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2 tracking-tight">{item.title}</h3>
                <p className="text-[12px] text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── WHY CHOOSE US ───────────── */}
      <section className="relative z-10 py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(isIG
              ? [
                  { icon: Users, title: "Comprehensive Growth", desc: "Profile reach and content engagement managed in one single campaign." },
                  { icon: Heart, title: "Content-Specific Strategy", desc: "Choose exactly which posts receive prioritized promotion." },
                  { icon: Clock, title: "Organic-Paced Growth", desc: "24-72 hour paced campaigns for a natural, algorithm-friendly pattern." },
                  { icon: Shield, title: "Secure Payments", desc: "Stripe-powered checkout with full encryption." },
                ]
              : [
                  { icon: Users, title: "Comprehensive Growth", desc: "Profile reach and content engagement managed in one single campaign." },
                  { icon: Heart, title: "Content-Specific Strategy", desc: "Choose exactly which videos receive prioritized promotion." },
                  { icon: Clock, title: "Organic-Paced Growth", desc: "24-72 hour paced campaigns for a natural, algorithm-friendly pattern." },
                  { icon: Shield, title: "Secure Payments", desc: "Stripe-powered checkout with full encryption." },
                ]
            ).map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={v}
                custom={i}
                className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${accent}12` }}>
                  <item.icon className="w-5 h-5" style={{ color: accent }} />
                </div>
                <h3 className="text-[14px] font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-[12px] text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── GUARANTEES ───────────── */}
      <section className="relative z-10 py-12 md:py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-10">
            <motion.h2 variants={v} custom={0} className="text-[clamp(1.4rem,3.5vw,2.5rem)] font-semibold text-white tracking-tight">
              Our Guarantees
            </motion.h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-4">
            {[
              { icon: Shield, title: "Privacy-First Infrastructure", desc: "Our system operates entirely externally. We only require your public handle to analyze and route traffic to your profile." },
              { icon: Clock, title: "Organic-Paced Growth", desc: "Campaigns are distributed over 24-72 hours to ensure safe, natural-looking profile velocity." },
              { icon: CheckCircle2, title: "Refund Policy", desc: "If we are unable to deliver on the agreed campaign metrics, you will receive a full refund." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={v}
                custom={i}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-white/[0.04]">
                  <item.icon className="w-5 h-5" style={{ color: accent }} />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="relative z-10 py-16 md:py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 lg:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-14">
            <motion.p variants={v} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">
              FAQ
            </motion.p>
            <motion.h2 variants={v} custom={1} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              Frequently Asked Questions
            </motion.h2>
          </motion.div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.06] px-6 sm:px-8">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── CTA BOTTOM ───────────── */}
      <section className="relative z-10 py-16 md:py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 lg:px-12 text-center">
          <h2 className="text-[clamp(1.6rem,4vw,2.8rem)] font-semibold text-white tracking-tight">
            Ready to get started?
          </h2>
          <p className="mt-4 text-[15px] text-zinc-400">
            Enter your username and configure your personalized growth campaign.
          </p>
          <button
            onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="shine mt-8 inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ background: gradient }}
          >
            {isIG ? <InstagramIcon className="w-5 h-5" /> : <TikTokIcon className="w-5 h-5" />}
            Get Started
          </button>
        </div>
      </section>
      </div>}

      {/* ───────────── BUNDLE CHECKOUT MODAL ───────────── */}
      <BundleCheckoutModal />
    </>
  );
}
