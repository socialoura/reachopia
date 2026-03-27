"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Zap,
  Target,
  Brain,
  Lock,
  ChevronDown,
  Check,
  Users,
  TrendingUp,
  BarChart3,
  Eye,
  Flame,
  Radio,
} from "lucide-react";
import CheckoutModal from "@/components/ui/CheckoutModal";
import type { CheckoutTier } from "@/components/ui/CheckoutModal";
import { toCheckoutTiers } from "@/lib/pricing-utils";
import { useCurrency } from "@/context/CurrencyContext";
import { usePostHog } from "posthog-js/react";
import { useIsMobile } from "@/hooks/useMediaQuery";

/* ─── TikTok Icon ─── */
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

const noAnim = {
  hidden: { opacity: 1, y: 0 },
  visible: () => ({ opacity: 1, y: 0, transition: { duration: 0 } }),
};

/* ─── Styling Constants ─── */
const TT_ACCENT = "#ee1d52";
const TT_GRADIENT = "linear-gradient(135deg, #69C9D0 0%, #ee1d52 100%)";

/* ─── FAQ Data ─── */
const faqs = [
  {
    q: "How does your TikTok AI targeting work?",
    a: "Our algorithm analyzes your content style, sound usage, audience signals, and engagement velocity to map optimal growth vectors. We then deploy your profile across our network of active TikTok users who match your niche — driving organic discovery through the For You Page algorithm.",
  },
  {
    q: "Will this affect my TikTok account safety?",
    a: "Never. We don't require your password or login credentials — only your public username. Our methods are 100% compliant with TikTok's community guidelines and use organic audience targeting exclusively.",
  },
  {
    q: "How fast will I see results?",
    a: "Most campaigns begin delivering measurable profile momentum within minutes. Full deployment completes within 24-72 hours with gradual, algorithm-friendly delivery patterns that maximize For You Page visibility.",
  },
  {
    q: "Can this help my videos go viral?",
    a: "Our AI amplification engine increases your engagement velocity — one of the key signals TikTok's algorithm uses to push content to the For You Page. Higher initial engagement creates a snowball effect for organic reach.",
  },
  {
    q: "What's the difference between tiers?",
    a: "Higher tiers unlock faster deployment speeds, advanced niche targeting, dedicated growth specialists, and extended retention guarantees. The Accelerate tier offers the best balance of virality potential and ROI.",
  },
];

/* ─── FAQ Accordion Item ─── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-6 text-left gap-4"
      >
        <span className="text-[15px] font-medium text-white">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-zinc-500 flex-shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
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
   TIKTOK PRODUCT PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function TikTokPage() {
  const posthog = usePostHog();
  const isMobile = useIsMobile();
  const v = isMobile ? noAnim : fadeUp;
  const { currency, symbol: currencySymbol } = useCurrency();
  const [modalOpen, setModalOpen] = useState(false);
  const [ttTiers, setTtTiers] = useState<CheckoutTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<CheckoutTier | null>(null);

  useEffect(() => {
    fetch("/api/pricing")
      .then((res) => res.json())
      .then((data) => {
        if (data.tiktok) {
          const tiers = toCheckoutTiers(data.tiktok, currency);
          setTtTiers(tiers);
          setSelectedTier(tiers[Math.min(3, tiers.length - 1)] || tiers[0]);
        }
      })
      .catch(console.error);
  }, [currency]);

  const handlePackClick = (tier: CheckoutTier) => {
    posthog?.capture("package_selected", { volume: tier.volume, price: tier.price, network: "tiktok" });
    setSelectedTier(tier);
    setModalOpen(true);
  };

  return (
    <>
      {/* ───────────── GLOBAL AMBIENT GLOW ───────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[15vh] left-1/4 w-[600px] h-[500px] rounded-full bg-[#69C9D0]/10 blur-[120px]" />
        <div className="absolute top-[60vh] right-1/4 w-[500px] h-[400px] rounded-full bg-[#ee1d52]/10 blur-[100px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[300px] rounded-full bg-[#69C9D0]/5 blur-[100px]" />
      </div>

      {/* ───────────── HERO + PACK GRID (Above the Fold) ───────────── */}
      <section className="relative z-10 min-h-[100dvh] flex items-center overflow-hidden">

        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 w-full pt-28 pb-16 md:pt-36 md:pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm">
              <TikTokIcon className="w-3.5 h-3.5 text-[#69C9D0]" />
              <span className="text-[12px] font-medium text-zinc-300">TikTok Viral Engine</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] as const }}
            className="text-center text-[clamp(1.8rem,4.5vw,3.2rem)] font-semibold text-white tracking-tight leading-[1.1]"
          >
            Select Your <span className="text-gradient-tt">TikTok</span>
            <br />
            AI Growth Volume
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="mt-4 text-center text-[14px] sm:text-[16px] text-zinc-400 leading-relaxed max-w-lg mx-auto">
            Tap a volume to instantly configure your viral campaign.
            Results guaranteed.
          </motion.p>

          {/* ── 8-Pack Grid ── */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35 }} className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {ttTiers.map((tier, i) => (
              <button
                key={i}
                onClick={() => handlePackClick(tier)}
                className="group relative rounded-2xl p-4 sm:p-5 text-center border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-300 hover:border-[#ee1d52]/50 hover:shadow-[0_0_24px_-4px_rgba(238,29,82,0.25)] active:scale-[0.97]"
              >
                {i === 3 && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white whitespace-nowrap" style={{ background: TT_GRADIENT }}>
                    Popular
                  </span>
                )}
                <span className="block text-[20px] sm:text-[22px] font-semibold text-white tracking-tight group-hover:text-white/90 transition-colors">{tier.label}</span>
                <span className="block mt-0.5 text-[10px] font-medium text-[#69C9D0]/70 group-hover:text-[#69C9D0] transition-colors">AI Reach</span>
                <span className="block mt-2 text-[15px] font-semibold text-zinc-300 group-hover:text-white transition-colors">{currencySymbol}{tier.price.toFixed(2)}</span>
                <span className="block text-[11px] text-zinc-600 line-through">{currencySymbol}{tier.originalPrice.toFixed(2)}</span>
              </button>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }} className="mt-6 flex items-center justify-center gap-5 text-[11px] text-zinc-600">
            <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> Stripe secured</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Instant activation</span>
          </motion.div>
        </div>
      </section>

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section id="how-it-works" className="relative z-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.p variants={v} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#69C9D0] mb-4">
              Viral Amplification
            </motion.p>
            <motion.h2 variants={v} custom={1} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              How Our TikTok AI Works
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {[
              {
                step: "01",
                icon: Users,
                title: "Profile Analysis",
                desc: "Enter your username. Our AI scans your content style, sounds, hashtags, and engagement velocity patterns.",
              },
              {
                step: "02",
                icon: Brain,
                title: "FYP Algorithm Mapping",
                desc: "We reverse-engineer TikTok's recommendation engine to identify high-intent users who engage with content like yours.",
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Viral Deployment",
                desc: "Your profile is amplified across our network with engagement-velocity optimization — signaling TikTok's algorithm to push your content wider.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={v}
                custom={i}
                className="relative rounded-2xl p-7 sm:p-8 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 group"
              >
                <span className="absolute top-6 right-6 text-[40px] font-bold text-white/[0.04] group-hover:text-[#69C9D0]/10 transition-colors leading-none">
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-xl bg-[#69C9D0]/10 flex items-center justify-center mb-5 group-hover:bg-[#69C9D0]/20 transition-colors">
                  <item.icon className="w-6 h-6 text-[#69C9D0]" />
                </div>
                <h3 className="text-[17px] font-semibold text-white mb-2 tracking-tight">{item.title}</h3>
                <p className="text-[14px] text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FEATURES — TT Specific ───────────── */}
      <section className="relative z-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={v}
              custom={0}
            >
              <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl">
                <Image
                  src="/product-tiktok/2.png"
                  alt="TikTok Analytics"
                  width={600}
                  height={450}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </motion.div>

            {/* Features list */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.p variants={v} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#69C9D0] mb-4">
                Why Reachopia for TikTok
              </motion.p>
              <motion.h2 variants={v} custom={1} className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-semibold text-white tracking-tight mb-8">
                Engineered for the
                <br />
                For You Page
              </motion.h2>

              <div className="space-y-5">
                {[
                  { icon: Flame, title: "Engagement Velocity Boost", desc: "Rapid initial engagement signals tell TikTok's algorithm your content deserves wider distribution — triggering the viral snowball effect." },
                  { icon: Radio, title: "FYP Signal Optimization", desc: "We optimize the key signals TikTok uses to rank content: watch time, shares, comments, and profile visits — all from real users." },
                  { icon: Eye, title: "Discoverability Amplification", desc: "Increased profile authority and engagement velocity push your content into more For You Pages, search results, and suggested accounts." },
                  { icon: BarChart3, title: "Real-Time Campaign Tracking", desc: "Monitor your growth metrics in real-time and watch your TikTok momentum build with transparent, honest analytics." },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={v}
                    custom={i + 2}
                    className="flex gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#69C9D0]/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-[#69C9D0]" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-[13px] text-zinc-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────── SOCIAL PROOF ───────────── */}
      <section className="relative z-10 py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.h2 variants={v} custom={0} className="text-[clamp(1.4rem,3vw,2.2rem)] font-semibold text-white tracking-tight">
              Trusted by Thousands of Creators
            </motion.h2>
            <motion.p variants={v} custom={1} className="mt-3 text-[14px] text-zinc-500 max-w-md mx-auto">
              Real results from real accounts using our AI-powered TikTok growth platform.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-[#69C9D0]/5">
              <Image
                src="/product-tiktok/3.png"
                alt="TikTok Growth Results"
                width={1000}
                height={560}
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="relative z-10 py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-14"
          >
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

      {/* ───────────── FINAL CTA ───────────── */}
      <section className="relative z-10 py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[400px] rounded-full bg-[#69C9D0]/8 blur-[120px]" />
          <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-[500px] h-[400px] rounded-full bg-[#ee1d52]/6 blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <motion.h2 variants={v} custom={0} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              Ready to Go Viral on <span className="text-gradient-tt">TikTok?</span>
            </motion.h2>
            <motion.p variants={v} custom={1} className="mt-5 text-[15px] text-zinc-400 max-w-md mx-auto leading-relaxed">
              Scroll up and pick your volume — activation takes 60 seconds.
            </motion.p>
            <motion.div variants={v} custom={2} className="mt-10">
              <Link href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="shine inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-[#ee1d52] text-white text-[14px] font-semibold hover:bg-[#d91845] transition-colors"
              >
                Choose a Package
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.p variants={v} custom={3} className="mt-5 text-[11px] text-zinc-600">
              Stripe secured · Results guaranteed
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Checkout Modal ── */}
      {selectedTier && (
        <CheckoutModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          platform="tiktok"
          tier={selectedTier}
          accentColor={TT_ACCENT}
          accentGradient={TT_GRADIENT}
          currencySymbol={currencySymbol}
        />
      )}
    </>
  );
}
