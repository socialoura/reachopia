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
  ChevronRight,
  Sparkles,
  Star,
  Users,
  Heart,
  Eye,
  Clock,
  CheckCircle2,
  ArrowRight,
  Play,
  BarChart3,
  Globe,
  Lock,
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

/* ─── FAQ ─── */
const faqs = [
  { q: "How does the campaign work?", a: "After you configure your growth campaign and complete payment, our AI engine begins optimizing your profile's reach. Campaigns are distributed over 24-72 hours to ensure organic, algorithm-friendly growth." },
  { q: "Is my account secure during the campaign?", a: "Yes. Our systems operate entirely externally. We never ask for your login details, ensuring your account remains 100% secure and under your full control." },
  { q: "Can I prioritize specific content?", a: "Yes. After configuring your campaign goals, you can select which of your recent videos should receive prioritized promotion and amplification." },
  { q: "What results can I expect?", a: "Our AI targets active, real users within your niche. Campaign delivery is paced gradually to match organic patterns. Some natural fluctuation over time is expected." },
  { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards (Visa, Mastercard, Amex), Apple Pay, and Google Pay. All payments are processed securely through Stripe." },
  { q: "What is your refund policy?", a: "If we are unable to deliver on the agreed campaign metrics, you will receive a full refund. Contact our support team if you experience any issues." },
];

/* ─── Animated counter ─── */
function AnimCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

/* ─── FAQ Accordion Item ─── */
function FAQRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const posthog = usePostHog();
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => {
          if (!open) posthog?.capture("tiktok_faq_clicked", { question: q });
          setOpen(!open);
        }}
        className="flex items-center justify-between w-full py-5 text-left gap-4"
      >
        <span className="text-[14px] font-medium text-white">{q}</span>
        <ChevronDown className={`w-4 h-4 text-zinc-500 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-[13px] text-zinc-400 leading-relaxed">{a}</p>
      </motion.div>
    </div>
  );
}

/* ─── Compact step badge ─── */
function StepBadge({ number, label, active, done }: { number: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
          active
            ? "bg-white text-black"
            : done
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            : "bg-white/[0.05] text-zinc-600 border border-white/[0.08]"
        }`}
      >
        {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : number}
      </div>
      <span className={`text-[12px] font-medium hidden sm:inline ${active ? "text-white" : done ? "text-emerald-400" : "text-zinc-600"}`}>
        {label}
      </span>
    </div>
  );
}

/* ─── Horizontal step progress ─── */
function StepProgress({ currentStep }: { currentStep: string }) {
  const steps = [
    { key: "bundle", label: "Configure", n: 1 },
    { key: "assignLikes", label: "Likes", n: 2 },
    { key: "assignViews", label: "Views", n: 3 },
    { key: "recap", label: "Checkout", n: 4 },
  ];

  const activeSteps = ["bundle", "assignLikes", "assignViews", "recap", "checkout"];
  if (!activeSteps.includes(currentStep)) return null;

  const currentIdx = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center gap-1 sm:gap-3 mb-6">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1 sm:gap-3">
          <StepBadge number={s.n} label={s.label} active={s.key === currentStep} done={i < currentIdx} />
          {i < steps.length - 1 && (
            <ChevronRight className={`w-3 h-3 ${i < currentIdx ? "text-emerald-500/40" : "text-white/[0.08]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE — pricing-socials "Split Layout + Social Proof"
   ═══════════════════════════════════════════════════════════════ */
/* ─── Scroll section tracker (fires once per section) ─── */
function useScrollSectionTracker(posthog: ReturnType<typeof usePostHog>, variant: string) {
  const firedRef = useRef<Set<string>>(new Set());
  const observe = useCallback(
    (sectionName: string) => (node: HTMLElement | null) => {
      if (!node || firedRef.current.has(sectionName)) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !firedRef.current.has(sectionName)) {
            firedRef.current.add(sectionName);
            posthog?.capture("section_viewed", { section: sectionName, variant });
            observer.disconnect();
          }
        },
        { threshold: 0.3 },
      );
      observer.observe(node);
    },
    [posthog, variant],
  );
  return observe;
}

export default function PricingSocialsPage() {
  const posthog = usePostHog();
  const isMobile = useIsMobile();
  const { currency } = useCurrency();
  const hasTrackedRef = useRef(false);
  const trackSection = useScrollSectionTracker(posthog, "pricing-socials");

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
      posthog?.capture("tiktok_landing_viewed", { referrer: document.referrer || "direct", variant: "pricing-socials" });
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

  /* ─── Lazy-load videos/posts in background ─── */
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

  /* Scroll to top on step change (mobile only — desktop uses sticky) + track */
  useEffect(() => {
    if (isMobile && step !== "search" && step !== "scanning") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    posthog?.capture("step_changed", { step, platform, variant: "pricing-socials" });
  }, [step, isMobile]);

  const hasPosts = (profile?.posts?.length ?? 0) > 0;
  const isSearchPhase = step === "search" || step === "scanning";
  const isConfigPhase = !isSearchPhase;

  return (
    <>
      {/* ───────────── SEARCH PHASE: Full-width split hero ───────────── */}
      {isSearchPhase && (
        <div className="relative z-10 min-h-[100dvh] flex flex-col -mt-16 md:mt-0">
          {/* Subtle gradient mesh background */}
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.07] transition-colors duration-700" style={{ backgroundColor: accent }} />
              <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full blur-[130px] opacity-[0.05]" style={{ backgroundColor: isIG ? "#8134af" : "#69C9D0" }} />
            </div>
          </div>

          {/* Main split hero */}
          <div className="relative z-10 flex-1 flex items-center">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 md:py-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                {/* LEFT — Copy + Social Proof */}
                <div className="order-2 lg:order-1">
                  {/* Platform switcher — pill tabs */}
                  <div className="inline-flex items-center rounded-lg bg-white/[0.04] border border-white/[0.08] p-0.5 mb-8">
                    {(["tiktok", "instagram"] as const).map((p) => {
                      const active = platform === p;
                      return (
                        <button
                          key={p}
                          onClick={() => { if (!active) { posthog?.capture("platform_switched", { from: platform, to: p, variant: "pricing-socials" }); reset(); setPlatform(p); } }}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-[12px] font-semibold tracking-wide uppercase transition-all duration-300 ${
                            active ? "text-white bg-white/[0.1]" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {p === "tiktok" ? <TikTokIcon className="w-3.5 h-3.5" /> : <InstagramIcon className="w-3.5 h-3.5" />}
                          {p === "tiktok" ? "TikTok" : "Instagram"}
                        </button>
                      );
                    })}
                  </div>

                  <h1 className="text-[clamp(1.75rem,4.5vw,3.8rem)] font-bold text-white tracking-tight leading-[1.1] mb-6">
                    Grow your{" "}
                    <span className="relative inline-block">
                      <span className={`bg-gradient-to-r ${isIG ? "from-[#f58529] via-[#dd2a7b] to-[#8134af]" : "from-[#69C9D0] to-[#ee1d52]"} bg-clip-text text-transparent`}>
                        {isIG ? "Instagram" : "TikTok"}
                      </span>
                      <span className="absolute -bottom-1 left-0 w-full h-[3px] rounded-full" style={{ background: gradient, opacity: 0.4 }} />
                    </span>
                    <span className="hidden sm:inline"><br /></span>{" "}
                    audience today.
                  </h1>

                  {/* Social proof counters */}
                  {mounted && (
                    <div data-nosnippet="" className="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:gap-8 mb-8 sm:mb-10">
                      {[
                        { value: 12847, label: "Campaigns delivered", icon: BarChart3 },
                        { value: 4200, label: "Active creators", icon: Users },
                        { value: 98, suffix: "%", label: "Satisfaction rate", icon: Star },
                      ].map((stat, i) => (
                        <div key={i} className="flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-3">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.08]">
                            <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
                          </div>
                          <div className="text-center sm:text-left">
                            <p className="text-[15px] sm:text-[18px] font-bold text-white leading-none">
                              <AnimCounter target={stat.value} />
                              {stat.suffix ?? "+"}
                            </p>
                            <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5">{stat.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                {/* RIGHT — Search Card */}
                <div className="order-1 lg:order-2">
                  <div className="relative rounded-3xl bg-white/[0.03] border border-white/[0.08] p-6 sm:p-8 backdrop-blur-sm">
                    {/* Card header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: gradient }}>
                        {isIG ? <InstagramIcon className="w-5 h-5 text-white" /> : <TikTokIcon className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <h2 className="text-[16px] font-semibold text-white">Start your campaign</h2>
                        <p className="text-[12px] text-zinc-500">Enter your username to begin</p>
                      </div>
                    </div>

                    <ProfileSearchInput />

                    {profileError && (
                      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-[13px] text-red-400">
                        {profileError}
                      </motion.p>
                    )}

                    {/* Mini how-it-works inside card */}
                    {mounted && (
                      <div data-nosnippet="" className="mt-8 pt-6 border-t border-white/[0.06]">
                        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-600 mb-4">How it works</p>
                        <div className="space-y-3">
                          {[
                            { n: "1", text: "Enter your public username" },
                            { n: "2", text: "Configure your growth targets" },
                            { n: "3", text: "Select content to promote" },
                            { n: "4", text: "Pay securely & launch" },
                          ].map((s) => (
                            <div key={s.n} className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-zinc-500 flex-shrink-0">
                                {s.n}
                              </div>
                              <span className="text-[13px] text-zinc-400">{s.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ───────────── BELOW THE FOLD — Social proof + FAQ (search phase only) ───────────── */}
          {mounted && <div data-nosnippet="">
            {/* Testimonials / Social proof band */}
            <section ref={trackSection("testimonials")} className="relative z-10 py-16 md:py-24 border-t border-white/[0.04]">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">
                <div className="text-center mb-12">
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-3">Trusted by creators worldwide</p>
                  <h2 className="text-[clamp(1.4rem,3.5vw,2.4rem)] font-bold text-white tracking-tight">Why creators choose us</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    {
                      quote: "My engagement tripled in the first week. The campaign felt completely organic.",
                      name: "Sarah M.",
                      role: "Lifestyle Creator",
                      followers: "45K followers",
                    },
                    {
                      quote: "I was skeptical at first, but the results spoke for themselves. Real followers, real engagement.",
                      name: "Alex T.",
                      role: "Fitness Influencer",
                      followers: "120K followers",
                    },
                    {
                      quote: "The best part is choosing which videos get boosted. Smart and easy to use.",
                      name: "Mia L.",
                      role: "Beauty Creator",
                      followers: "28K followers",
                    },
                  ].map((t, i) => (
                    <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-[14px] text-zinc-300 leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-[11px] font-bold text-zinc-400">
                          {t.name[0]}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-white">{t.name}</p>
                          <p className="text-[11px] text-zinc-500">{t.role} &middot; {t.followers}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Guarantees — horizontal strip */}
            <section ref={trackSection("guarantees")} className="relative z-10 py-12 md:py-16 border-t border-white/[0.04]">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: Shield, title: "Privacy-First", desc: "No login required. We only need your public handle." },
                    { icon: Clock, title: "24-72h Delivery", desc: "Gradual, algorithm-friendly campaign pacing." },
                    { icon: Globe, title: "Global Reach", desc: "Active, real users targeted within your niche." },
                    { icon: CheckCircle2, title: "Refund Guarantee", desc: "Full refund if we can't deliver on agreed metrics." },
                  ].map((g, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}10` }}>
                        <g.icon className="w-5 h-5" style={{ color: accent }} />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-semibold text-white mb-1">{g.title}</h3>
                        <p className="text-[12px] text-zinc-500 leading-relaxed">{g.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section ref={trackSection("faq")} className="relative z-10 py-16 md:py-24 border-t border-white/[0.04]">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12">
                <div className="text-center mb-12">
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-3">FAQ</p>
                  <h2 className="text-[clamp(1.4rem,3.5vw,2.4rem)] font-bold text-white tracking-tight">Common questions</h2>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6">
                  {faqs.map((faq, i) => (
                    <FAQRow key={i} q={faq.q} a={faq.a} />
                  ))}
                </div>
              </div>
            </section>

            {/* CTA bottom */}
            <section ref={trackSection("cta_bottom")} className="relative z-10 py-16 md:py-20 border-t border-white/[0.04]">
              <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
                <h2 className="text-[clamp(1.5rem,3.5vw,2.6rem)] font-bold text-white tracking-tight mb-4">
                  Start your campaign now
                </h2>
                <p className="text-[15px] text-zinc-400 mb-8">
                  Join thousands of creators growing their audience with AI-powered campaigns.
                </p>
                <button
                  onClick={() => { posthog?.capture("cta_bottom_clicked", { variant: "pricing-socials", platform }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-white text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
                  style={{ background: gradient }}
                >
                  {isIG ? <InstagramIcon className="w-5 h-5" /> : <TikTokIcon className="w-5 h-5" />}
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </section>
          </div>}
        </div>
      )}

      {/* ───────────── CONFIG PHASE: Split layout (desktop) ───────────── */}
      {isConfigPhase && (
        <div className="relative z-10 min-h-[100dvh]">
          {/* Subtle background */}
          <div className="pointer-events-none fixed inset-0 z-0">
            <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[160px] opacity-[0.06] transition-colors duration-700" style={{ backgroundColor: accent }} />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 md:py-10">
            {/* Top bar: back + steps */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={reset} className="text-[13px] text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5">
                <ChevronDown className="w-3.5 h-3.5 rotate-90" />
                New search
              </button>
              <div className="hidden md:block">
                <StepProgress currentStep={step} />
              </div>
            </div>

            {/* Mobile step progress */}
            <div className="md:hidden mb-4">
              <StepProgress currentStep={step} />
            </div>

            {/* Split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* LEFT SIDEBAR — Profile + trust (sticky on desktop) */}
              <div className="lg:col-span-5 xl:col-span-4 min-w-0">
                <div className="lg:sticky lg:top-6 space-y-4">
                  {/* Profile card */}
                  <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4 overflow-hidden">
                    <ProfileCard />
                  </div>

                  {/* Trust sidebar */}
                  <div className="hidden lg:block rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 space-y-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-600 mb-2">Guarantees</p>
                    {[
                      { icon: Shield, text: "No login required" },
                      { icon: Clock, text: "24-72h gradual delivery" },
                      { icon: CheckCircle2, text: "Full refund if undelivered" },
                      { icon: Lock, text: "Stripe-encrypted payments" },
                    ].map((g, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <g.icon className="w-4 h-4 flex-shrink-0" style={{ color: accent }} />
                        <span className="text-[12px] text-zinc-400">{g.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Payment badges */}
                  <div className="hidden lg:flex items-center justify-center gap-2 py-3">
                    <Image
                      src="/badges_paiement.png"
                      alt="Accepted payment methods"
                      width={140}
                      height={18}
                      className="h-4 w-auto object-contain opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT — Main content area */}
              <div className="lg:col-span-7 xl:col-span-8 min-w-0">
                <AnimatePresence mode="wait">
                  {/* ══════════ BUNDLE ══════════ */}
                  {step === "bundle" && profile && (
                    <motion.div
                      key="bundle"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <BundleConfigurator />
                    </motion.div>
                  )}

                  {/* ══════════ ASSIGN LIKES ══════════ */}
                  {step === "assignLikes" && profile && (
                    <motion.div
                      key="assignLikes"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                    >
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
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                    >
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
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                    >
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

                      {/* Payment badges (mobile) */}
                      <div className="mt-6 flex items-center justify-center gap-3 lg:hidden flex-wrap">
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
            </div>
          </div>
        </div>
      )}

      {/* ───────────── BUNDLE CHECKOUT MODAL ───────────── */}
      <BundleCheckoutModal />
    </>
  );
}
