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
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useTranslation } from "@/context/TranslationContext";

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

const noAnim = {
  hidden: { opacity: 1, y: 0 },
  visible: () => ({ opacity: 1, y: 0, transition: { duration: 0 } }),
};

/* ─── Styling Constants ─── */
const IG_ACCENT = "#dd2a7b";
const IG_GRADIENT = "linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)";

/* ─── FAQ Data ─── */

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
  const { t } = useTranslation();
  const posthog = usePostHog();
  const isMobile = useIsMobile();
  const v = isMobile ? noAnim : fadeUp;
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

  const faqs = [
    { q: t("igPage.faq1Q"), a: t("igPage.faq1A") },
    { q: t("igPage.faq2Q"), a: t("igPage.faq2A") },
    { q: t("igPage.faq3Q"), a: t("igPage.faq3A") },
    { q: t("igPage.faq4Q"), a: t("igPage.faq4A") },
    { q: t("igPage.faq5Q"), a: t("igPage.faq5A") },
  ];

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
                {t("igPage.badge")}
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
            {t("igPage.heroTitle1")} <span className="text-gradient-ig">{t("igPage.heroTitle2")}</span>
            <br />
            {t("igPage.heroTitle3")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-4 text-center text-[14px] sm:text-[16px] text-zinc-400 leading-relaxed max-w-lg mx-auto"
          >
            {t("igPage.heroSubtitle")}
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
                    {t("igPage.popular")}
                  </span>
                )}
                <span className="block text-[20px] sm:text-[22px] font-semibold text-white tracking-tight group-hover:text-white/90 transition-colors">
                  {tier.label}
                </span>
                <span className="block mt-0.5 text-[10px] font-medium text-[#dd2a7b]/70 group-hover:text-[#dd2a7b] transition-colors">
                  {t("igPage.aiReach")}
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
              <Shield className="w-3 h-3" /> {t("igPage.stripeSecured")}
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> {t("igPage.instantActivation")}
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
            <motion.p variants={v} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#dd2a7b] mb-4">
              {t("igPage.howLabel")}
            </motion.p>
            <motion.h2 variants={v} custom={1} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              {t("igPage.howTitle")}
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {[
              { step: "01", icon: Users, title: t("igPage.how1Title"), desc: t("igPage.how1Desc") },
              { step: "02", icon: Brain, title: t("igPage.how2Title"), desc: t("igPage.how2Desc") },
              { step: "03", icon: TrendingUp, title: t("igPage.how3Title"), desc: t("igPage.how3Desc") },
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
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={v} custom={0}>
              <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl">
                <Image src="/product-instagram/2.png" alt="Instagram Analytics" width={600} height={450} className="w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.p variants={v} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#dd2a7b] mb-4">
                {t("igPage.featLabel")}
              </motion.p>
              <motion.h2 variants={v} custom={1} className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-semibold text-white tracking-tight mb-8">
                {t("igPage.featTitle1")}
                <br />
                {t("igPage.featTitle2")}
              </motion.h2>
              <div className="space-y-5">
                {[
                  { icon: Target, title: t("igPage.feat1Title"), desc: t("igPage.feat1Desc") },
                  { icon: Heart, title: t("igPage.feat2Title"), desc: t("igPage.feat2Desc") },
                  { icon: Eye, title: t("igPage.feat3Title"), desc: t("igPage.feat3Desc") },
                  { icon: BarChart3, title: t("igPage.feat4Title"), desc: t("igPage.feat4Desc") },
                ].map((item, i) => (
                  <motion.div key={i} variants={v} custom={i + 2} className="flex gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors">
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
            <motion.h2 variants={v} custom={0} className="text-[clamp(1.4rem,3vw,2.2rem)] font-semibold text-white tracking-tight">
              {t("igPage.socialProofTitle")}
            </motion.h2>
            <motion.p variants={v} custom={1} className="mt-3 text-[14px] text-zinc-500 max-w-md mx-auto">
              {t("igPage.socialProofDesc")}
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
            <motion.p variants={v} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">{t("igPage.faqLabel")}</motion.p>
            <motion.h2 variants={v} custom={1} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              {t("igPage.faqTitle")}
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
            <motion.h2 variants={v} custom={0} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              {t("igPage.ctaTitle")} <span className="text-gradient-ig">{t("igPage.ctaTitleHighlight")}</span>
            </motion.h2>
            <motion.p variants={v} custom={1} className="mt-5 text-[15px] text-zinc-400 max-w-md mx-auto leading-relaxed">
              {t("igPage.ctaSubtitle")}
            </motion.p>
            <motion.div variants={v} custom={2} className="mt-10">
              <Link href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="shine inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
              >
                {t("igPage.ctaButton")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.p variants={v} custom={3} className="mt-5 text-[11px] text-zinc-600">
              {t("igPage.ctaSecured")}
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
