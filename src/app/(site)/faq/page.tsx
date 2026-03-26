/* ═══════════════════════════════════════════════════════════════
   FAQ Page — Frequently Asked Questions with Accordion
   Dark mode, responsive, SEO-optimized with JSON-LD schema
   ═══════════════════════════════════════════════════════════════ */

"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface FaqItem {
  question: string;
  answer: string;
}

const faqData: FaqItem[] = [
  {
    question: "Do I need to share my password?",
    answer: "Absolutely not. We never ask for your password. Our AI only needs your public username to analyze your profile and deliver targeted growth. Your account security is our top priority, and we use industry-standard encryption for all data processing.",
  },
  {
    question: "Is there any risk of my account getting banned?",
    answer: "Zero risk. We use 100% organic growth methods that fully comply with Instagram and TikTok's terms of service. Unlike spammy bots, our AI targets real, active users in your niche through authentic engagement patterns. Your account stays safe and grows naturally.",
  },
  {
    question: "How long does it take to see results?",
    answer: "Your campaign activates in under 60 seconds after payment. First results typically appear within 1-12 hours depending on your pack size. Larger campaigns may take up to 24-48 hours for full delivery as we prioritize quality and organic pacing to keep your account safe.",
  },
  {
    question: "Are these real accounts interacting with my profile?",
    answer: "Yes, 100% real and active accounts. Our AI-powered audience engine identifies profiles that match your niche, interests, and demographics. These are genuine users who are likely to engage with your content long-term, not fake bots or inactive accounts.",
  },
  {
    question: "Is it a one-time payment or a subscription?",
    answer: "One-time payment only. No hidden subscriptions, no automatic renewals, no surprise charges. You pay once for the growth pack you choose, and that's it. Want more growth later? Simply come back and purchase another campaign whenever you're ready.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a Results Guarantee. If your campaign doesn't deliver the promised reach within the specified timeframe, we'll issue a full refund—no questions asked. We're confident in our AI technology and stand behind every campaign we run.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqData.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />

      <div className="min-h-screen bg-zinc-950 text-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden border-b border-white/[0.08]">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                <MessageCircle className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-400">Support Center</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Frequently Asked{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Questions
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto">
                Everything you need to know about our AI-powered growth service for Instagram and TikTok.
              </p>
            </motion.div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left hover:bg-white/[0.03] transition-colors"
                >
                  <span className="text-base sm:text-lg font-semibold text-white pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-500 flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
                        <div className="border-t border-white/[0.06] pt-4">
                          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 p-8 sm:p-12 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-pink-500/5" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Still have questions?
              </h2>
              <p className="text-base sm:text-lg text-zinc-400 mb-8 max-w-xl mx-auto">
                Our support team is here to help. Or start your growth journey now and see the results for yourself.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/pricing"
                  className="shine w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-base transition-all hover:opacity-90 active:scale-[0.97]"
                >
                  Calculate My Growth Potential
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/[0.15] bg-white/[0.05] text-white font-semibold text-base transition-all hover:bg-white/[0.08] active:scale-[0.97]"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
