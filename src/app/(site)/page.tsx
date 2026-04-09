"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/useMediaQuery";
import CountUp from "react-countup";
import {
  ArrowRight,
  Shield,
  Zap,
  Target,
  Brain,
  BarChart3,
  Lock,
  ChevronDown,
  Check,
  Users,
  TrendingUp,
  Eye,
} from "lucide-react";
import { useTranslation } from "@/context/TranslationContext";

/* ─── Wrapper: renders <motion.div> on desktop, plain <div> on mobile ─── */
function M({ mobile, children, className, ...motionProps }: { mobile: boolean; children: React.ReactNode; className?: string; [key: string]: any }) {
  if (mobile) return <div className={className}>{children}</div>;
  return <motion.div className={className} {...motionProps}>{children}</motion.div>;
}

/* ─── Custom Icons (not in lucide-react) ─── */
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
        transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
        className="overflow-hidden"
      >
        <p className="pb-6 text-[14px] text-zinc-400 leading-relaxed">{a}</p>
      </motion.div>
    </div>
  );
}

/* ─── TikTok Icon (custom SVG since lucide doesn't have it) ─── */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.6 5.82A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function Home() {
  const isMobile = useIsMobile();
  const v = isMobile ? noAnim : fadeUp;
  const { t } = useTranslation();

  const faqs = [
    { q: t("home.faq1Q"), a: t("home.faq1A") },
    { q: t("home.faq2Q"), a: t("home.faq2A") },
    { q: t("home.faq3Q"), a: t("home.faq3A") },
    { q: t("home.faq4Q"), a: t("home.faq4A") },
    { q: t("home.faq5Q"), a: t("home.faq5A") },
  ];

  const stats = [
    { value: 50000, suffix: "+", label: t("home.stat1Label"), icon: Users, accent: "#a78bfa" },
    { value: 4.9, decimals: 1, suffix: "/5", label: t("home.stat2Label"), icon: TrendingUp, accent: "#34d399" },
    { value: 98, suffix: "%", label: t("home.stat3Label"), icon: Shield, accent: "#60a5fa" },
    { value: 24, suffix: "/7", label: t("home.stat4Label"), icon: Zap, accent: "#facc15" },
  ];

  return (
    <>
      {/* ───────────── HERO — iPhone-launch style ───────────── */}
      <section className="relative min-h-[90dvh] sm:min-h-[100dvh] flex items-center overflow-hidden bg-black">
        {/* Ambient glow — hidden on mobile for perf */}
        {!isMobile && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
            <div className="absolute bottom-0 left-1/3 w-[600px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />
          </div>
        )}

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-28 sm:pb-20 md:pt-36 md:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left — Text + CTAs */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] mb-8">
                <div className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${isMobile ? '' : 'animate-glow'}`} />
                <span className="text-[12px] font-medium text-zinc-300">
                  {t("home.badge")}
                </span>
              </div>

              {/* H1 */}
              <h1 className="text-[clamp(2rem,6vw,4rem)] font-extrabold text-white tracking-tight leading-[1.08]">
                {t("home.heroTitle1")}
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">{t("home.heroTitle2")}</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-5 sm:mt-6 text-[15px] sm:text-[17px] text-zinc-400 leading-relaxed max-w-lg">
                {t("home.heroSubtitle")}
              </p>

              {/* CTA */}
              <div className="mt-8 sm:mt-10">
                <Link
                  href="/pricing-socials"
                  className="shine w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-4 min-h-[48px] rounded-full bg-white text-black text-[15px] font-semibold hover:bg-zinc-100 transition-colors"
                >
                  {t("home.ctaButton")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Micro trust */}
              <div className="mt-6 sm:mt-8 flex flex-wrap gap-4 sm:gap-5 text-[11px] sm:text-[12px] text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-zinc-400" /> {t("home.trustSafe")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-zinc-400" /> {t("home.trustInstant")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-zinc-400" /> {t("home.ctaSecured")}
                </span>
              </div>
            </div>

            {/* Right — Hero image (no float on mobile) */}
            <div className="relative">
              <Image
                src="/hero-section.png"
                alt="Reachopia AI Dashboard"
                width={1200}
                height={680}
                className={`w-full h-auto rounded-2xl ${isMobile ? '' : 'drop-shadow-[0_20px_50px_rgba(124,58,237,0.15)]'}`}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── SERVICE CARDS — Platform Selection ───────────── */}
      <section className="py-16 sm:py-20 md:py-28 lg:py-32 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-3 sm:mb-4">
              {t("home.platformSectionLabel")}
            </p>
            <h2 className="text-[clamp(1.5rem,4vw,3rem)] font-semibold text-white tracking-tight">
              {t("home.platformSectionTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 max-w-4xl mx-auto">
            {/* Instagram Card */}
            <M mobile={isMobile} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={v} custom={0}>
              <Link href="/pricing-socials?platform=instagram" className="group block">
                <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] bg-zinc-950 hover:border-white/[0.12] transition-all duration-500">
                  {!isMobile && <div className="absolute inset-0 bg-gradient-to-br from-[#f58529]/5 via-[#dd2a7b]/5 to-[#8134af]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
                  <div className="relative p-6 sm:p-8 md:p-10">
                    <div className="flex items-center gap-3 mb-5 sm:mb-6">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] flex items-center justify-center">
                        <InstagramIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider text-emerald-400">{t("home.badgePopular") || "Popular"}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mb-2">
                      {t("home.instagramCardTitle")}
                    </h3>
                    <p className="text-[13px] sm:text-[14px] text-zinc-400 leading-relaxed mb-6 sm:mb-8">
                      {t("home.instagramCardDesc")}
                    </p>
                    <div className="relative h-[160px] sm:h-[200px] rounded-2xl overflow-hidden border border-white/[0.06]">
                      <Image
                        src="/product-instagram/1.png"
                        alt="Instagram Growth"
                        fill
                        className={`object-cover ${isMobile ? '' : 'group-hover:scale-105 transition-transform duration-700'}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent" />
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-[13px] font-medium text-zinc-400 group-hover:text-white transition-colors">
                      {t("home.instagramCardCta")}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </M>

            {/* TikTok Card */}
            <M mobile={isMobile} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={v} custom={1}>
              <Link href="/pricing-socials?platform=tiktok" className="group block">
                <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] bg-zinc-950 hover:border-white/[0.12] transition-all duration-500">
                  {!isMobile && <div className="absolute inset-0 bg-gradient-to-br from-[#69C9D0]/5 via-transparent to-[#ee1d52]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
                  <div className="relative p-6 sm:p-8 md:p-10">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#69C9D0] via-[#010101] to-[#ee1d52] flex items-center justify-center mb-5 sm:mb-6">
                      <TikTokIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mb-2">
                      {t("home.tiktokCardTitle")}
                    </h3>
                    <p className="text-[13px] sm:text-[14px] text-zinc-400 leading-relaxed mb-6 sm:mb-8">
                      {t("home.tiktokCardDesc")}
                    </p>
                    <div className="relative h-[160px] sm:h-[200px] rounded-2xl overflow-hidden border border-white/[0.06]">
                      <Image
                        src="/product-tiktok/1.png"
                        alt="TikTok Growth"
                        fill
                        className={`object-cover ${isMobile ? '' : 'group-hover:scale-105 transition-transform duration-700'}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent" />
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-[13px] font-medium text-zinc-400 group-hover:text-white transition-colors">
                      {t("home.tiktokCardCta")}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </M>
          </div>
        </div>
      </section>

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section id="how-it-works" className="py-16 sm:py-20 md:py-28 lg:py-32 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">
              {t("home.howItWorksLabel")}
            </p>
            <h2 className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              {t("home.howItWorksTitle")}
            </h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {/* Connector line between steps (desktop only) */}
            {!isMobile && (
              <div className="hidden md:block absolute top-[56px] left-[calc(33.33%+12px)] right-[calc(33.33%+12px)] h-px bg-gradient-to-r from-white/[0.06] via-white/[0.1] to-white/[0.06]" />
            )}
            {[
              {
                step: "01",
                icon: Users,
                accent: "#a78bfa",
                title: t("home.step1Title"),
                desc: t("home.step1Desc"),
              },
              {
                step: "02",
                icon: Brain,
                accent: "#c084fc",
                title: t("home.step2Title"),
                desc: t("home.step2Desc"),
              },
              {
                step: "03",
                icon: TrendingUp,
                accent: "#f472b6",
                title: t("home.step3Title"),
                desc: t("home.step3Desc"),
              },
            ].map((item, i) => (
              <M
                key={i}
                mobile={isMobile}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={v}
                custom={i}
                className="relative rounded-2xl p-7 sm:p-8 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 group"
              >
                <span className="absolute top-6 right-6 text-[40px] font-bold text-white/[0.06] leading-none">
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `${item.accent}15` }}>
                  <item.icon className="w-6 h-6" style={{ color: item.accent }} />
                </div>
                <h3 className="text-[17px] font-semibold text-white mb-2 tracking-tight">{item.title}</h3>
                <p className="text-[14px] text-zinc-500 leading-relaxed">{item.desc}</p>
              </M>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── BENTO GRID — Tech / AI Features (Google Ads) ───────────── */}
      <section className="py-16 sm:py-20 md:py-28 lg:py-32 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-3 sm:mb-4">
              {t("home.techLabel")}
            </p>
            <h2 className="text-[clamp(1.5rem,4vw,3rem)] font-semibold text-white tracking-tight">
              {t("home.techTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {[
              { icon: Shield, accent: "#34d399", title: t("home.feat1Title"), desc: t("home.feat1Desc") },
              { icon: Target, accent: "#f472b6", title: t("home.feat2Title"), desc: t("home.feat2Desc") },
              { icon: Zap, accent: "#facc15", title: t("home.feat3Title"), desc: t("home.feat3Desc") },
              { icon: BarChart3, accent: "#60a5fa", title: t("home.feat4Title"), desc: t("home.feat4Desc") },
              { icon: Brain, accent: "#c084fc", title: t("home.feat5Title"), desc: t("home.feat5Desc") },
              { icon: Eye, accent: "#fb923c", title: t("home.feat6Title"), desc: t("home.feat6Desc") },
            ].map((item, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 sm:p-7 border border-white/[0.06] bg-white/[0.02] ${isMobile ? '' : 'hover:bg-white/[0.04] hover:-translate-y-0.5'} transition-all duration-500 group`}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${item.accent}12`, borderColor: `${item.accent}20`, borderWidth: 1 }}>
                  <item.icon className="w-5 h-5" style={{ color: item.accent }} />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-1.5 tracking-tight">{item.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── STATS ───────────── */}
      <section className="py-12 sm:py-16 md:py-20 bg-black border-y border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.accent}12` }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.accent }} />
                </div>
                <p className="text-[clamp(2rem,4vw,3.5rem)] font-bold text-white tracking-tight leading-none">
                  {isMobile ? (
                    <>{stat.decimals ? stat.value.toFixed(stat.decimals) : stat.value.toLocaleString()}{stat.suffix}</>
                  ) : (
                    <><CountUp
                      end={stat.value}
                      decimals={stat.decimals || 0}
                      duration={2.5}
                      enableScrollSpy
                      scrollSpyOnce
                    />{stat.suffix}</>
                  )}
                </p>
                <p className="text-[12px] sm:text-[13px] text-zinc-500 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="py-16 sm:py-20 md:py-28 lg:py-32 bg-zinc-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">
              {t("home.faqLabel")}
            </p>
            <h2 className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              {t("home.faqTitle")}
            </h2>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.06] px-6 sm:px-8">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FINAL CTA ───────────── */}
      <section className="relative py-16 sm:py-24 md:py-32 lg:py-36 bg-black overflow-hidden">
        {!isMobile && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-violet-600/10 blur-[100px]" />
          </div>
        )}
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-[clamp(1.6rem,4vw,3rem)] font-extrabold text-white tracking-tight">
            {t("home.ctaTitle1")}
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">{t("home.ctaTitle2")}</span>
          </h2>
          <p className="mt-5 text-[16px] text-zinc-400 max-w-md mx-auto leading-relaxed">
            {t("home.ctaSubtitle")}
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/pricing-socials?platform=instagram"
              className="shine w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-4 min-h-[48px] rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[15px] font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-600/20"
            >
              {t("home.ctaButton")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Image src="/reviews/stars.svg" alt="5 stars" width={88} height={18} className="h-[18px] w-auto" />
            <span className="text-[12px] text-zinc-500 font-medium">4.9/5 (2,847+)</span>
          </div>
          <p className="mt-3 text-[11px] text-zinc-600">
            {t("home.ctaSecured")}
          </p>
        </div>
      </section>
    </>
  );
}
