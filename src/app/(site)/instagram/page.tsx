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
  Heart,
} from "lucide-react";
import CheckoutModal from "@/components/ui/CheckoutModal";
import type { CheckoutTier } from "@/components/ui/CheckoutModal";
import { toCheckoutTiers } from "@/lib/pricing-utils";
import { useCurrency } from "@/context/CurrencyContext";
import { usePostHog } from "posthog-js/react";

/* ─── Custom Instagram Icon ─── */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
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

/* ─── Styling Constants ─── */
const IG_ACCENT = "#dd2a7b";
const IG_GRADIENT = "linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)";

/* ─── FAQ Data ─── */
const faqs = [
  {
    q: "How does your Instagram AI targeting work?",
    a: "Our algorithm analyzes your content category, hashtag usage, audience demographics, and engagement patterns to identify ideal users within your niche. We then deploy your profile across our premium audience network, driving organic discovery from real, active Instagram users.",
  },
  {
    q: "Will this affect my Instagram account safety?",
    a: "Never. We don't require your password or login credentials — only your public username. Our methods are 100% compliant with Instagram's guidelines and use organic audience targeting exclusively.",
  },
  {
    q: "How fast will I see results?",
    a: "Most campaigns begin delivering measurable profile momentum within minutes. Full deployment completes within 24-72 hours with gradual, algorithm-friendly delivery patterns.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes. Every campaign is backed by our Results Guarantee. If we cannot deliver the agreed-upon reach metrics, you receive a full refund.",
  },
  {
    q: "What's the difference between tiers?",
    a: "Higher tiers unlock faster deployment speeds, advanced niche targeting, dedicated growth specialists, and extended retention guarantees.",
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
   INSTAGRAM PRODUCT PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function InstagramPage() {
  const posthog = usePostHog();
  const { currency, symbol: currencySymbol } = useCurrency();
  const [modalOpen, setModalOpen] = useState(false);
  const [igTiers, setIgTiers] = useState<CheckoutTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<CheckoutTier | null>(null);

  useEffect(() => {
    fetch("/api/pricing")
      .then((res) => res.json())
      .then((data) => {
        if (data.instagram) {
          const tiers = toCheckoutTiers(data.instagram, currency);
          setIgTiers(tiers);
          setSelectedTier(tiers[Math.min(3, tiers.length - 1)] || tiers[0]);
        }
      })
      .catch(console.error);
  }, [currency]);

  const handlePackClick = (tier: CheckoutTier) => {
    posthog?.capture("package_selected", { volume: tier.volume, price: tier.price, network: "instagram" });
    setSelectedTier(tier);
    setModalOpen(true);
  };

  return (
    <>
      {/* ───────────── GLOBAL AMBIENT GLOW ───────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[15vh] left-1/3 w-[700px] h-[500px] rounded-full bg-[#dd2a7b]/10 blur-[120px]" />
        <div className="absolute top-[60vh] right-1/4 w-[500px] h-[400px] rounded-full bg-[#8134af]/10 blur-[100px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[300px] rounded-full bg-[#f58529]/8 blur-[100px]" />
      </div>

      {/* ───────────── HERO + PACK GRID (Above the Fold) ───────────── */}
      <section className="relative z-10 min-h-[100dvh] flex items-center overflow-hidden">

        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 w-full pt-28 pb-16 md:pt-36 md:pb-24">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm">
              <InstagramIcon className="w-3.5 h-3.5 text-[#dd2a7b]" />
              <span className="text-[12px] font-medium text-zinc-300">
                Instagram Growth Engine
              </span>
            </div>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] as const }}
            className="text-center text-[clamp(1.8rem,4.5vw,3.2rem)] font-semibold text-white tracking-tight leading-[1.1]"
          >
            Select Your <span className="text-gradient-ig">Instagram</span>
            <br />
            AI Growth Volume
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-4 text-center text-[14px] sm:text-[16px] text-zinc-400 leading-relaxed max-w-lg mx-auto"
          >
            Tap a volume to instantly configure your growth campaign.
            Results guaranteed.
          </motion.p>

          {/* ── 8-Pack Grid ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3"
          >
            {igTiers.map((tier, i) => (
              <button
                key={i}
                onClick={() => handlePackClick(tier)}
                className="group relative rounded-2xl p-4 sm:p-5 text-center border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-300 hover:border-[#dd2a7b]/50 hover:shadow-[0_0_24px_-4px_rgba(221,42,123,0.25)] active:scale-[0.97]"
              >
                {i === 3 && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white whitespace-nowrap" style={{ background: IG_GRADIENT }}>
                    Popular
                  </span>
                )}
                <span className="block text-[20px] sm:text-[22px] font-semibold text-white tracking-tight group-hover:text-white/90 transition-colors">
                  {tier.label}
                </span>
                <span className="block mt-0.5 text-[10px] font-medium text-[#dd2a7b]/70 group-hover:text-[#dd2a7b] transition-colors">
                  AI Reach
                </span>
                <span className="block mt-2 text-[15px] font-semibold text-zinc-300 group-hover:text-white transition-colors">
                  {currencySymbol}{tier.price.toFixed(2)}
                </span>
                <span className="block text-[11px] text-zinc-600 line-through">
                  {currencySymbol}{tier.originalPrice.toFixed(2)}
                </span>
              </button>
            ))}
          </motion.div>

          {/* Trust line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6 flex items-center justify-center gap-5 text-[11px] text-zinc-600"
          >
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3" /> Stripe secured
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> Instant activation
            </span>
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
            <motion.p variants={fadeUp} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#dd2a7b] mb-4">
              Algorithm Targeting
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              How Our Instagram AI Works
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {[
              { step: "01", icon: Users, title: "Profile Analysis", desc: "Enter your username. Our AI scans your content category, hashtags, audience demographics, and engagement patterns." },
              { step: "02", icon: Brain, title: "Niche Mapping", desc: "We reverse-engineer Instagram's algorithm to identify high-intent users in your exact niche who are most likely to engage." },
              { step: "03", icon: TrendingUp, title: "Organic Deployment", desc: "Your profile is amplified across our audience network with gradual, algorithm-safe delivery that mimics natural discovery." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="relative rounded-2xl p-7 sm:p-8 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 group"
              >
                <span className="absolute top-6 right-6 text-[40px] font-bold text-white/[0.04] group-hover:text-[#dd2a7b]/10 transition-colors leading-none">
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-xl bg-[#dd2a7b]/10 flex items-center justify-center mb-5 group-hover:bg-[#dd2a7b]/20 transition-colors">
                  <item.icon className="w-6 h-6 text-[#dd2a7b]" />
                </div>
                <h3 className="text-[17px] font-semibold text-white mb-2 tracking-tight">{item.title}</h3>
                <p className="text-[14px] text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FEATURES ───────────── */}
      <section className="relative z-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl">
                <Image src="/product-instagram/2.png" alt="Instagram Analytics" width={600} height={450} className="w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.p variants={fadeUp} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#dd2a7b] mb-4">
                Why Reachopia for Instagram
              </motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-semibold text-white tracking-tight mb-8">
                Engineered for the
                <br />
                Instagram Algorithm
              </motion.h2>
              <div className="space-y-5">
                {[
                  { icon: Target, title: "Hashtag & Niche Intelligence", desc: "AI maps your top-performing content categories to target users who actively engage with similar accounts." },
                  { icon: Heart, title: "Engagement-First Targeting", desc: "We prioritize users with high engagement tendencies — not just follower count — for authentic, lasting growth." },
                  { icon: Eye, title: "Explore Page Optimization", desc: "Increased profile visits and engagement signals boost your visibility in Instagram's Explore and Reels algorithms." },
                  { icon: BarChart3, title: "Real-Time Analytics", desc: "Track your campaign performance with transparent metrics and watch your momentum build in real-time." },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i + 2} className="flex gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-[#dd2a7b]/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-[#dd2a7b]" />
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
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <motion.h2 variants={fadeUp} custom={0} className="text-[clamp(1.4rem,3vw,2.2rem)] font-semibold text-white tracking-tight">
              Trusted by Thousands of Creators
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-3 text-[14px] text-zinc-500 max-w-md mx-auto">
              Real results from real accounts using our AI-powered Instagram growth platform.
            </motion.p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-[#dd2a7b]/5">
              <Image src="/product-instagram/3.png" alt="Instagram Growth Results" width={1000} height={560} className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="relative z-10 py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">FAQ</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#dd2a7b]/8 blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              Ready to Grow Your <span className="text-gradient-ig">Instagram?</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-5 text-[15px] text-zinc-400 max-w-md mx-auto leading-relaxed">
              Scroll up and pick your volume — activation takes 60 seconds.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="mt-10">
              <Link href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="shine inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
              >
                Choose a Package
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} custom={3} className="mt-5 text-[11px] text-zinc-600">
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
          platform="instagram"
          tier={selectedTier}
          accentColor={IG_ACCENT}
          accentGradient={IG_GRADIENT}
          currencySymbol={currencySymbol}
        />
      )}
    </>
  );
}
