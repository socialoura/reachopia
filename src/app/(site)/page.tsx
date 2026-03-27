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

/* ─── Data ─── */
const faqs = [
  {
    q: "How does your AI-powered growth technology work?",
    a: "Our proprietary algorithm analyzes your profile, content niche, and target demographics to deploy your account across our premium audience network. This drives qualified, active users to discover your profile organically — resulting in genuine engagement and sustainable growth.",
  },
  {
    q: "How quickly will I see results from my campaign?",
    a: "Most campaigns begin delivering measurable profile momentum within minutes of activation. Full network amplification completes within 24-72 hours depending on your selected growth tier.",
  },
  {
    q: "Is my account safe with Reachopia?",
    a: "Absolutely. We never request your password or login credentials. Our system only requires your public username. All growth methods are 100% compliant with platform guidelines.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept all major credit cards, PayPal, and cryptocurrency. Every transaction is secured with 256-bit SSL encryption.",
  },
  {
    q: "What is your performance guarantee?",
    a: "Every campaign is backed by our Results Guarantee. If we cannot deliver the agreed-upon reach metrics, you receive a full refund plus a 30-day retention commitment.",
  },
];

const stats = [
  { value: 50000, suffix: "+", label: "Active Campaigns" },
  { value: 4.9, decimals: 1, suffix: "/5", label: "Client Rating" },
  { value: 98, suffix: "%", label: "Retention Rate" },
  { value: 24, suffix: "/7", label: "Support Available" },
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

  return (
    <>
      {/* ───────────── HERO — iPhone-launch style ───────────── */}
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden bg-black">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 w-[600px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-5 sm:px-8 pt-28 pb-20 md:pt-36 md:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Text + CTAs */}
            <div>
              {/* Badge */}
              <motion.div
                initial={isMobile ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={isMobile ? { duration: 0 } : { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm mb-8"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-glow" />
                <span className="text-[12px] font-medium text-zinc-300">
                  Trusted by 50,000+ creators & brands
                </span>
              </motion.div>

              {/* H1 */}
              <motion.h1
                initial={isMobile ? false : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={isMobile ? { duration: 0 } : { duration: 0.8, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
                className="text-[clamp(2rem,5vw,4rem)] font-semibold text-white tracking-tight leading-[1.05]"
              >
                AI-Powered Growth
                <br />
                <span className="text-gradient-white">for Social Media</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={isMobile ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={isMobile ? { duration: 0 } : { duration: 0.7, delay: 0.25 }}
                className="mt-6 text-[15px] sm:text-[17px] text-zinc-400 leading-relaxed max-w-lg"
              >
                Our proprietary algorithm connects your profile to a network of active,
                niche-relevant users — delivering guaranteed reach and organic momentum.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={isMobile ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={isMobile ? { duration: 0 } : { duration: 0.7, delay: 0.4 }}
                className="mt-10 flex flex-col sm:flex-row gap-4"
              >
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

              {/* Micro trust */}
              <motion.div
                initial={isMobile ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={isMobile ? { duration: 0 } : { duration: 0.5, delay: 0.6 }}
                className="mt-8 flex flex-wrap gap-5 text-[11px] text-zinc-600"
              >
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3" /> 100% platform safe
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> Instant activation
                </span>
              </motion.div>
            </div>

            {/* Right — Hero image (floating) */}
            <motion.div
              initial={isMobile ? false : { opacity: 0, x: 40, scale: 0.97 }}
              animate={isMobile ? { opacity: 1 } : {
                opacity: 1,
                x: 0,
                scale: 1,
                y: [0, -12, 0],
              }}
              transition={isMobile ? { duration: 0 } : {
                opacity: { duration: 1, delay: 0.4 },
                x: { duration: 1, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] },
                scale: { duration: 1, delay: 0.4 },
                y: {
                  duration: 4,
                  delay: 1.4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                },
              }}
              className="relative"
            >
              <Image
                src="/hero-section.png"
                alt="Reachopia AI Dashboard"
                width={1200}
                height={680}
                className="w-full h-auto rounded-2xl drop-shadow-[0_20px_50px_rgba(124,58,237,0.15)]"
                priority
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────── SOCIAL PROOF BAR ───────────── */}
      <section className="py-10 bg-zinc-950 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-center text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-600 mb-6">
            As featured in
          </p>
          <div className="flex items-center justify-center opacity-50 grayscale brightness-200">
            <Image
              src="/logo/forbes.png"
              alt="Forbes"
              width={120}
              height={32}
              className="h-6 md:h-8 w-auto object-contain select-none"
            />
          </div>
        </div>
      </section>

      {/* ───────────── SERVICE CARDS — Platform Selection ───────────── */}
      <section className="py-24 md:py-32 bg-black">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.p variants={v} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">
              Choose Your Platform
            </motion.p>
            <motion.h2 variants={v} custom={1} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              Where do you want to grow?
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 max-w-4xl mx-auto">
            {/* Instagram Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={v}
              custom={0}
            >
              <Link href="/instagram" className="group block">
                <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] bg-zinc-950 hover:border-white/[0.12] transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#f58529]/5 via-[#dd2a7b]/5 to-[#8134af]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-8 sm:p-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] flex items-center justify-center mb-6">
                      <InstagramIcon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white tracking-tight mb-2">
                      Instagram Growth
                    </h3>
                    <p className="text-[14px] text-zinc-400 leading-relaxed mb-8">
                      AI-powered audience targeting optimized for the Instagram
                      algorithm. Reach real users in your niche and build
                      lasting organic momentum.
                    </p>
                    <div className="relative h-[200px] rounded-2xl overflow-hidden border border-white/[0.06]">
                      <Image
                        src="/product-instagram/1.png"
                        alt="Instagram Growth"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent" />
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-[13px] font-medium text-zinc-400 group-hover:text-white transition-colors">
                      Explore Instagram packages
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* TikTok Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={v}
              custom={1}
            >
              <Link href="/tiktok" className="group block">
                <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] bg-zinc-950 hover:border-white/[0.12] transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#69C9D0]/5 via-transparent to-[#ee1d52]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-8 sm:p-10">
                    <div className="w-14 h-14 rounded-2xl bg-black border border-white/[0.1] flex items-center justify-center mb-6">
                      <TikTokIcon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white tracking-tight mb-2">
                      TikTok Growth
                    </h3>
                    <p className="text-[14px] text-zinc-400 leading-relaxed mb-8">
                      Viral amplification engine built for TikTok&apos;s
                      recommendation algorithm. Maximize discoverability
                      and scale your audience fast.
                    </p>
                    <div className="relative h-[200px] rounded-2xl overflow-hidden border border-white/[0.06]">
                      <Image
                        src="/product-tiktok/1.png"
                        alt="TikTok Growth"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent" />
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-[13px] font-medium text-zinc-400 group-hover:text-white transition-colors">
                      Explore TikTok packages
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section id="how-it-works" className="py-24 md:py-32 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.p variants={v} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">
              3-step process
            </motion.p>
            <motion.h2 variants={v} custom={1} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              How It Works
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {[
              {
                step: "01",
                icon: Users,
                title: "Submit Your Username",
                desc: "Enter your public profile handle. We never ask for your password or login credentials.",
              },
              {
                step: "02",
                icon: Brain,
                title: "AI Analyzes Your Niche",
                desc: "Our algorithm maps your content category, audience demographics, and optimal growth vectors.",
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Campaign Goes Live",
                desc: "Your profile is deployed across our premium audience network. Measurable results begin within minutes.",
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
                <span className="absolute top-6 right-6 text-[40px] font-bold text-white/[0.04] group-hover:text-white/[0.08] transition-colors leading-none">
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center mb-5 group-hover:bg-white/[0.1] transition-colors">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[17px] font-semibold text-white mb-2 tracking-tight">{item.title}</h3>
                <p className="text-[14px] text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── BENTO GRID — Tech / AI Features (Google Ads) ───────────── */}
      <section className="py-24 md:py-32 bg-black">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.p variants={v} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">
              Our Technology
            </motion.p>
            <motion.h2 variants={v} custom={1} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              Built for Results
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {[
              { icon: Shield, title: "100% Platform Compliant", desc: "Fully aligned with platform guidelines. Zero account risk — ever." },
              { icon: Target, title: "Premium Audience Network", desc: "Every campaign targets real, active users within your niche matched by our AI." },
              { icon: Zap, title: "Rapid Deployment", desc: "See measurable momentum within minutes. Our system activates instantly upon order." },
              { icon: BarChart3, title: "Guaranteed Results", desc: "Every tier includes a results guarantee and 30-day retention commitment." },
              { icon: Brain, title: "AI-Powered Targeting", desc: "Our algorithm continuously optimizes campaign targeting for maximum growth velocity." },
              { icon: Eye, title: "Transparent Analytics", desc: "Real-time visibility into your campaign performance with clear, honest metrics." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={v}
                custom={i}
                className="rounded-2xl p-6 sm:p-7 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 hover:-translate-y-0.5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4 group-hover:bg-white/[0.08] transition-colors duration-300">
                  <item.icon className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-1.5 tracking-tight">{item.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── STATS ───────────── */}
      <section className="py-20 bg-black border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={v}
                custom={i}
                className="text-center"
              >
                <p className="text-[clamp(2rem,4vw,3.5rem)] font-semibold text-white tracking-tight">
                  <CountUp
                    end={stat.value}
                    decimals={stat.decimals || 0}
                    duration={2.5}
                    enableScrollSpy
                    scrollSpyOnce
                  />
                  {stat.suffix}
                </p>
                <p className="text-[12px] sm:text-[13px] text-zinc-500 mt-1">{stat.label}</p>
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
      <section className="relative py-28 md:py-36 bg-black overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-violet-600/10 blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2
              variants={v}
              custom={0}
              className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight"
            >
              Ready to Accelerate
              <br />
              Your Growth?
            </motion.h2>
            <motion.p
              variants={v}
              custom={1}
              className="mt-5 text-[15px] text-zinc-400 max-w-md mx-auto leading-relaxed"
            >
              Join 50,000+ creators and brands using Reachopia&apos;s AI engine
              to build unstoppable social momentum.
            </motion.p>
            <motion.div variants={v} custom={2} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/instagram"
                className="shine w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-white text-black text-[14px] font-semibold hover:bg-zinc-100 transition-colors"
              >
                Start Growth
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.p variants={v} custom={3} className="mt-5 text-[11px] text-zinc-600">
              Stripe secured · Results guaranteed
            </motion.p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
