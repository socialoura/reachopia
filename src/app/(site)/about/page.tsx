"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Shield,
  Eye,
  Users,
  Target,
  Brain,
  Zap,
  ChevronDown,
  ArrowRight,
  Lock,
  Check,
  Globe,
  BarChart3,
} from "lucide-react";

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

/* ─── Animated Counter ─── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── FAQ Accordion ─── */
const faqs = [
  { q: "Is Reachopia safe and compliant?", a: "Yes. Our growth methodology is 100% platform-compliant. We never request passwords or access tokens. All campaigns operate through organic audience targeting via our proprietary network — your account is never at risk." },
  { q: "How long has Reachopia been operating?", a: "Reachopia has been engineering social media growth solutions for over 5 years, serving thousands of creators, brands, and agencies worldwide with AI-driven campaign technology." },
  { q: "What is your guarantee policy?", a: "Every campaign includes a performance guarantee. If we fail to deliver the agreed-upon reach metrics, you receive a full refund. We also offer a 30-day retention commitment on all growth tiers." },
  { q: "Which platforms does your AI support?", a: "Our algorithm currently supports Instagram and TikTok growth campaigns. We are actively expanding our audience network to additional platforms." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full py-6 text-left gap-4">
        <span className="text-[15px] font-medium text-white">{q}</span>
        <ChevronDown className={`w-5 h-5 text-zinc-500 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <motion.div initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] as const }} className="overflow-hidden">
        <p className="pb-6 text-[14px] text-zinc-400 leading-relaxed">{a}</p>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ABOUT PAGE — Premium Dark Design
   ═══════════════════════════════════════════════════════════════ */
export default function AboutPage() {
  return (
    <>
      {/* ───────────── HERO ───────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-black">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-indigo-500/8 blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-5">
            About Reachopia
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.25, 0.4, 0.25, 1] as const }}
            className="text-[clamp(2rem,5vw,4rem)] font-semibold text-white tracking-tight leading-[1.08]"
          >
            Engineering Social
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400">
              Growth.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 text-[15px] sm:text-[17px] text-zinc-400 leading-relaxed max-w-xl mx-auto"
          >
            We use artificial intelligence to connect creators and brands
            with premium, niche-relevant audiences — driving real discovery
            and lasting algorithmic momentum.
          </motion.p>
        </div>
      </section>

      {/* ───────────── OUR TECHNOLOGY — Bento Grid ───────────── */}
      <section className="py-24 md:py-32 bg-black">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-indigo-400 mb-4">
              Our Technology
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              Three Pillars of Safe Growth
            </motion.h2>
          </motion.div>

          {/* Bento Grid — 3 large cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {[
              {
                icon: Brain,
                title: "AI Audience Targeting",
                desc: "Our proprietary algorithm analyzes content categories, hashtag ecosystems, and engagement patterns to identify the highest-intent users within your exact niche.",
                accent: "from-indigo-500 to-cyan-500",
              },
              {
                icon: Globe,
                title: "Organic Network Amplification",
                desc: "Your profile is deployed across our premium audience network with gradual, algorithm-friendly delivery patterns that mimic natural organic discovery.",
                accent: "from-emerald-500 to-cyan-500",
              },
              {
                icon: Shield,
                title: "100% Policy Compliant",
                desc: "We never request passwords or credentials. Every campaign operates within platform guidelines using organic audience targeting exclusively. Zero risk to your account.",
                accent: "from-amber-500 to-orange-500",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="relative rounded-2xl p-7 sm:p-8 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 group overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5 group-hover:bg-white/[0.06] transition-colors">
                  <item.icon className="w-6 h-6 text-zinc-300" />
                </div>
                <h3 className="text-[17px] font-semibold text-white mb-2.5 tracking-tight">{item.title}</h3>
                <p className="text-[14px] text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Extra detail cards — 2 cols */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-4 md:mt-5">
            {[
              { icon: BarChart3, title: "Real-Time Campaign Analytics", desc: "Monitor every metric in real-time — engagement velocity, profile visits, follower growth rate, and audience demographics — with full transparency." },
              { icon: Zap, title: "Algorithm-Safe Delivery", desc: "Our deployment engine uses variable-speed delivery patterns calibrated to each platform's detection thresholds, ensuring maximum safety and organic appearance." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="rounded-2xl p-7 sm:p-8 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5 group-hover:bg-white/[0.06] transition-colors">
                  <item.icon className="w-6 h-6 text-zinc-300" />
                </div>
                <h3 className="text-[17px] font-semibold text-white mb-2.5 tracking-tight">{item.title}</h3>
                <p className="text-[14px] text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── STATS ───────────── */}
      <section className="py-24 md:py-32 bg-black">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">
              By the Numbers
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              Trusted at Scale
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {[
              { value: 10, suffix: "M+", label: "AI Interactions Managed" },
              { value: 99.9, suffix: "%", label: "Platform Uptime" },
              { value: 5000, suffix: "+", label: "Active Creators" },
              { value: 150, suffix: "+", label: "Countries Served" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="rounded-2xl p-6 sm:p-8 border border-white/[0.06] bg-white/[0.02] text-center"
              >
                <p className="text-[clamp(1.8rem,4vw,2.8rem)] font-semibold text-white tracking-tight">
                  <Counter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-[12px] sm:text-[13px] text-zinc-500 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── TEAM ───────────── */}
      <section className="py-24 md:py-32 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">Our Team</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              The People Behind the Algorithm
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mt-3 text-[14px] text-zinc-500 max-w-lg mx-auto">
              Engineers, data scientists, and growth strategists at the intersection of AI and social media.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
            {[
              { name: "Sarah Mitchell", role: "CEO & Co-Founder" },
              { name: "David Park", role: "Head of AI & Engineering" },
              { name: "Lisa Thompson", role: "VP of Growth Operations" },
            ].map((member, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="rounded-2xl p-8 border border-white/[0.06] bg-white/[0.02] text-center hover:bg-white/[0.04] transition-all duration-500 group"
              >
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 mx-auto mb-4 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                  <span className="text-xl font-semibold text-indigo-400">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <h3 className="text-[16px] font-semibold text-white mb-1">{member.name}</h3>
                <p className="text-[13px] text-zinc-500">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── GROWTH SOLUTIONS ───────────── */}
      <section className="py-24 md:py-32 bg-black">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 mb-4">Growth Solutions</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              Platform-Specific AI Campaigns
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {[
              { platform: "Instagram", services: ["Audience Network Expansion", "Engagement Amplification", "Reach Optimization", "Reels Distribution", "Explore Page Boost"], accent: "#dd2a7b", gradient: "from-[#f58529] via-[#dd2a7b] to-[#8134af]", href: "/instagram" },
              { platform: "TikTok", services: ["FYP Visibility Boost", "Engagement Velocity", "Audience Amplification", "Content Distribution", "Profile Momentum"], accent: "#69C9D0", gradient: "from-[#69C9D0] to-[#ee1d52]", href: "/tiktok" },
            ].map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="rounded-2xl p-7 sm:p-8 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5`}>
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-[18px] font-semibold text-white mb-4">{item.platform} Growth</h3>
                <ul className="space-y-2.5 mb-6">
                  {item.services.map((service, si) => (
                    <li key={si} className="flex items-center gap-2.5 text-[14px] text-zinc-400">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: item.accent }} />
                      {service}
                    </li>
                  ))}
                </ul>
                <Link href={item.href}
                  className="inline-flex items-center gap-2 text-[13px] font-semibold text-white hover:text-zinc-300 transition-colors"
                >
                  Launch Campaign
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="py-24 md:py-32 bg-zinc-950">
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
      <section className="relative py-28 md:py-36 bg-black overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-indigo-500/8 blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-[clamp(1.6rem,4vw,3rem)] font-semibold text-white tracking-tight">
              Ready to Unlock Your Growth?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-5 text-[15px] text-zinc-400 max-w-md mx-auto leading-relaxed">
              Join thousands of creators using our AI to build unstoppable social momentum.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/instagram"
                className="shine inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
              >
                Instagram Growth
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/tiktok"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/[0.06] border border-white/[0.08] text-white text-[14px] font-medium hover:bg-white/[0.1] transition-colors"
              >
                TikTok Growth
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} custom={3} className="mt-5 text-[11px] text-zinc-600">
              Stripe secured · Results guaranteed
            </motion.p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
