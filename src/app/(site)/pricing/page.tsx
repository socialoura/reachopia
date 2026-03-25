"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Lock,
  Check,
  ChevronDown,
  Zap,
  Star,
  Sparkles,
} from "lucide-react";

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
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46v-7.15a8.16 8.16 0 005.58 2.18v-3.45a4.81 4.81 0 01-3.77-1.82V6.69z" />
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

/* ─── Platform Toggle ─── */
type Platform = "instagram" | "tiktok";

/* ─── Pricing Data ─── */
const plans = {
  instagram: [
    {
      name: "Starter",
      desc: "Perfect to test the waters",
      price: "6.99",
      originalPrice: "9.99",
      reach: "~500",
      features: [
        "AI audience targeting",
        "Gradual organic deployment",
        "24/7 campaign support",
        "30-day retention guarantee",
      ],
      cta: "Activate Starter",
      popular: false,
      href: "/instagram",
    },
    {
      name: "Accelerate",
      desc: "Best ROI — most popular",
      price: "10.99",
      originalPrice: "14.99",
      reach: "~1,000",
      features: [
        "Advanced niche targeting",
        "Priority deployment speed",
        "Dedicated growth specialist",
        "30-day retention guarantee",
        "Performance analytics",
      ],
      cta: "Activate Accelerate",
      popular: true,
      href: "/instagram",
    },
    {
      name: "Scale",
      desc: "For serious growth goals",
      price: "39.99",
      originalPrice: "54.99",
      reach: "~5,000",
      features: [
        "Premium audience network",
        "Maximum deployment speed",
        "VIP growth manager",
        "60-day retention guarantee",
        "Advanced analytics dashboard",
        "Campaign optimization",
      ],
      cta: "Activate Scale",
      popular: false,
      href: "/instagram",
    },
  ],
  tiktok: [
    {
      name: "Starter",
      desc: "Perfect to test the waters",
      price: "6.99",
      originalPrice: "9.99",
      reach: "~500",
      features: [
        "AI audience targeting",
        "Gradual organic deployment",
        "24/7 campaign support",
        "30-day retention guarantee",
      ],
      cta: "Activate Starter",
      popular: false,
      href: "/tiktok",
    },
    {
      name: "Accelerate",
      desc: "Best ROI — most popular",
      price: "10.99",
      originalPrice: "14.99",
      reach: "~1,000",
      features: [
        "Advanced niche targeting",
        "Priority deployment speed",
        "Dedicated growth specialist",
        "30-day retention guarantee",
        "Performance analytics",
      ],
      cta: "Activate Accelerate",
      popular: true,
      href: "/tiktok",
    },
    {
      name: "Scale",
      desc: "For serious growth goals",
      price: "39.99",
      originalPrice: "54.99",
      reach: "~5,000",
      features: [
        "Premium audience network",
        "Maximum deployment speed",
        "VIP growth manager",
        "60-day retention guarantee",
        "Advanced analytics dashboard",
        "Campaign optimization",
      ],
      cta: "Activate Scale",
      popular: false,
      href: "/tiktok",
    },
  ],
};

/* ─── Feature Comparison ─── */
const comparisonFeatures = [
  { label: "AI Audience Targeting", starter: true, accelerate: true, scale: true },
  { label: "Organic Deployment", starter: true, accelerate: true, scale: true },
  { label: "24/7 Campaign Support", starter: true, accelerate: true, scale: true },
  { label: "Retention Guarantee", starter: "30 days", accelerate: "30 days", scale: "60 days" },
  { label: "Advanced Niche Targeting", starter: false, accelerate: true, scale: true },
  { label: "Priority Deployment Speed", starter: false, accelerate: true, scale: true },
  { label: "Dedicated Growth Specialist", starter: false, accelerate: true, scale: true },
  { label: "Performance Analytics", starter: false, accelerate: true, scale: true },
  { label: "VIP Growth Manager", starter: false, accelerate: false, scale: true },
  { label: "Advanced Analytics Dashboard", starter: false, accelerate: false, scale: true },
  { label: "Campaign Optimization", starter: false, accelerate: false, scale: true },
];

/* ─── FAQ Data ─── */
const faqs = [
  {
    q: "Can I upgrade my plan later?",
    a: "Absolutely. You can upgrade to a higher tier at any time. Your existing campaign progress is preserved, and the upgrade takes effect immediately with enhanced targeting and deployment speed.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes. Every campaign is backed by our Results Guarantee. If we cannot deliver the agreed-upon reach metrics, you receive a full refund — no questions asked.",
  },
  {
    q: "Is there a subscription or recurring charge?",
    a: "No. Each plan is a one-time payment for a single growth campaign. There are no hidden fees, subscriptions, or auto-renewals.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards (Visa, Mastercard, Amex), Apple Pay, and Google Pay — all processed securely through Stripe with bank-grade encryption.",
  },
  {
    q: "How fast will I see results?",
    a: "Most campaigns begin delivering measurable profile momentum within minutes. Full deployment completes within 24-72 hours depending on your tier, with gradual, algorithm-friendly delivery.",
  },
  {
    q: "Do I need to share my password?",
    a: "Never. We only need your public username. We never ask for passwords, login credentials, or any sensitive account information.",
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

/* ─── Cell renderer for comparison table ─── */
function CellValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-4 h-4 text-emerald-400 mx-auto" />;
  if (value === false)
    return <span className="block w-4 h-[2px] bg-zinc-700 rounded mx-auto" />;
  return <span className="text-[12px] text-zinc-300 font-medium">{value}</span>;
}

/* ═══════════════════════════════════════════════════════════════
   PRICING PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function PricingPage() {
  const [platform, setPlatform] = useState<Platform>("instagram");

  const accent =
    platform === "instagram"
      ? { primary: "#dd2a7b", gradient: "from-[#f58529] via-[#dd2a7b] to-[#8134af]", textClass: "text-gradient-ig" }
      : { primary: "#ee1d52", gradient: "from-[#69C9D0] to-[#ee1d52]", textClass: "text-gradient-tt" };

  const currentPlans = plans[platform];

  return (
    <>
      {/* ───────────── HERO ───────────── */}
      <section className="relative pt-32 pb-10 md:pt-40 md:pb-14 bg-black overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[140px] transition-colors duration-700"
            style={{ backgroundColor: `${accent.primary}10` }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[12px] font-medium text-zinc-300">
              Simple, transparent pricing
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] as const }}
            className="text-[clamp(2rem,5vw,4rem)] font-semibold text-white tracking-tight leading-[1.08]"
          >
            One Price.{" "}
            <span className={accent.textClass}>Real Results.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-5 text-[15px] sm:text-[17px] text-zinc-400 leading-relaxed max-w-lg mx-auto"
          >
            No subscriptions. No hidden fees. Just AI-powered organic growth
            delivered with a results guarantee.
          </motion.p>

          {/* Platform toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 inline-flex items-center p-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]"
          >
            <button
              onClick={() => setPlatform("instagram")}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-semibold transition-all duration-300 ${
                platform === "instagram"
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <InstagramIcon className="w-4 h-4" />
              Instagram
            </button>
            <button
              onClick={() => setPlatform("tiktok")}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-semibold transition-all duration-300 ${
                platform === "tiktok"
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <TikTokIcon className="w-4 h-4" />
              TikTok
            </button>
          </motion.div>
        </div>
      </section>

      {/* ───────────── PRICING CARDS ───────────── */}
      <section className="pb-24 md:pb-32 bg-black">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex md:grid md:grid-cols-3 gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-5 px-5 md:mx-0 md:px-0 md:overflow-visible scrollbar-hide">
            {currentPlans.map((plan, i) => (
              <motion.div
                key={`${platform}-${i}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const }}
                className={`relative flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto snap-center rounded-2xl p-7 sm:p-8 border transition-all duration-500 hover:-translate-y-1 ${
                  plan.popular
                    ? `border-[${accent.primary}]/40 bg-[${accent.primary}]/[0.04] shadow-xl`
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
                style={
                  plan.popular
                    ? {
                        borderColor: `${accent.primary}66`,
                        backgroundColor: `${accent.primary}0a`,
                        boxShadow: `0 20px 60px -12px ${accent.primary}12`,
                      }
                    : undefined
                }
              >
                {plan.popular && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-[11px] font-semibold bg-gradient-to-r ${accent.gradient}`}
                  >
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-[17px] font-semibold text-white">{plan.name}</h3>
                  <p className="text-[12px] text-zinc-500 mt-0.5">{plan.desc}</p>
                </div>

                <div className="mb-1">
                  <span className="text-[13px] text-zinc-600 line-through mr-2">
                    ${plan.originalPrice}
                  </span>
                  <span className="text-[40px] font-semibold text-white tracking-tight">
                    ${plan.price}
                  </span>
                </div>
                <p className="text-[12px] text-zinc-500 mb-6">
                  Est. {plan.reach} audience reach · one-time
                </p>

                <Link
                  href={plan.href}
                  className={`shine block w-full text-center py-3.5 rounded-xl text-[13px] font-semibold transition-all ${
                    plan.popular
                      ? `bg-gradient-to-r ${accent.gradient} text-white hover:opacity-90`
                      : "bg-white/[0.06] text-white hover:bg-white/[0.1]"
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2.5 text-[13px] text-zinc-400">
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: accent.primary }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-4 text-[10px] text-zinc-600">
                  <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> No password</span>
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Stripe secured</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Payment badges */}
          <div className="mt-10 flex items-center justify-center gap-3 text-[11px] text-zinc-600">
            <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] font-medium">Stripe</span>
            <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] font-medium">Visa</span>
            <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] font-medium">Mastercard</span>
            <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] font-medium">Apple Pay</span>
          </div>
        </div>
      </section>

      {/* ───────────── COMPARISON TABLE ───────────── */}
      <section className="py-24 md:py-32 bg-zinc-950">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">
              Compare Plans
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              Feature Comparison
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
          >
            {/* Header */}
            <div className="grid grid-cols-4 border-b border-white/[0.06]">
              <div className="p-5 sm:p-6 text-[13px] font-semibold text-zinc-400">
                Feature
              </div>
              <div className="p-5 sm:p-6 text-center text-[13px] font-semibold text-zinc-300">
                Starter
              </div>
              <div className="p-5 sm:p-6 text-center relative">
                <span className="text-[13px] font-semibold text-white">Accelerate</span>
                <div className="absolute top-2 left-1/2 -translate-x-1/2">
                  <Star className="w-3 h-3" style={{ color: accent.primary }} />
                </div>
              </div>
              <div className="p-5 sm:p-6 text-center text-[13px] font-semibold text-zinc-300">
                Scale
              </div>
            </div>

            {/* Rows */}
            {comparisonFeatures.map((feat, i) => (
              <div
                key={i}
                className={`grid grid-cols-4 ${
                  i < comparisonFeatures.length - 1 ? "border-b border-white/[0.04]" : ""
                } hover:bg-white/[0.02] transition-colors`}
              >
                <div className="p-4 sm:p-5 text-[13px] text-zinc-400">{feat.label}</div>
                <div className="p-4 sm:p-5 text-center">
                  <CellValue value={feat.starter} />
                </div>
                <div className="p-4 sm:p-5 text-center bg-white/[0.01]">
                  <CellValue value={feat.accelerate} />
                </div>
                <div className="p-4 sm:p-5 text-center">
                  <CellValue value={feat.scale} />
                </div>
              </div>
            ))}

            {/* Price row */}
            <div className="grid grid-cols-4 border-t border-white/[0.08] bg-white/[0.02]">
              <div className="p-5 sm:p-6 text-[13px] font-semibold text-white">Price</div>
              <div className="p-5 sm:p-6 text-center text-[15px] font-semibold text-white">$6.99</div>
              <div className="p-5 sm:p-6 text-center text-[15px] font-semibold text-white">$10.99</div>
              <div className="p-5 sm:p-6 text-center text-[15px] font-semibold text-white">$39.99</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────────── GUARANTEES ───────────── */}
      <section className="py-24 md:py-32 bg-black">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">
              Every Plan Includes
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              Peace of Mind, Built In
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Shield,
                title: "Results Guarantee",
                desc: "Full refund if we don't deliver the agreed reach. No questions asked.",
              },
              {
                icon: Lock,
                title: "No Password Required",
                desc: "We never ask for your login. Only your public username is needed.",
              },
              {
                icon: Zap,
                title: "Instant Activation",
                desc: "Campaign begins within minutes of purchase. No waiting, no approvals.",
              },
              {
                icon: Star,
                title: "Premium Support",
                desc: "24/7 campaign support via email and live chat. Dedicated help at every tier.",
              },
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
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${accent.primary}15` }}
                >
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
      <section className="py-24 md:py-32 bg-zinc-950">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">
              FAQ
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              Pricing Questions
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
      <section className="relative py-28 md:py-36 bg-black overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] transition-colors duration-700"
            style={{ backgroundColor: `${accent.primary}0d` }}
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight"
            >
              Ready to Start Growing?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mt-5 text-[15px] text-zinc-400 max-w-md mx-auto leading-relaxed"
            >
              Activate your AI-powered growth campaign in under 60 seconds.
              One-time payment. No password required.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/instagram"
                className="shine w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white text-black text-[14px] font-semibold hover:bg-zinc-100 transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
                Instagram Growth
              </Link>
              <Link
                href="/tiktok"
                className="shine w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white/[0.08] border border-white/[0.1] text-white text-[14px] font-semibold hover:bg-white/[0.12] transition-colors backdrop-blur-sm"
              >
                <TikTokIcon className="w-4 h-4" />
                TikTok Growth
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} custom={3} className="mt-5 text-[11px] text-zinc-600">
              No password required · Stripe secured · Results guaranteed
            </motion.p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
