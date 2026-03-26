"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { X, Lock, Shield, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { trackGoogleAdsPurchase } from "@/lib/track-google-ads";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
export interface CheckoutTier {
  label: string;
  volume: string;
  price: number;
  originalPrice: number;
}

export interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: "instagram" | "tiktok";
  tier: CheckoutTier;
  accentColor: string;
  accentGradient: string;
  username?: string;
  currencySymbol?: string;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

/* ═══════════════════════════════════════════════════════════════
   INNER PAYMENT FORM (rendered inside <Elements>)
   ═══════════════════════════════════════════════════════════════ */
function PaymentForm({
  onSuccess,
  onBack,
  accentGradient,
  accentColor,
  price,
  currencySymbol,
}: {
  onSuccess: () => void;
  onBack: () => void;
  accentGradient: string;
  accentColor: string;
  price: number;
  currencySymbol: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Card / manual payment form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    });

    if (submitError) {
      setError(submitError.message || "Payment failed. Please try again.");
      setLoading(false);
    } else {
      setLoading(false);
      onSuccess();
    }
  };

  // Express Checkout (Apple Pay / Google Pay) confirm
  const handleExpressConfirm = async () => {
    if (!stripe || !elements) return;

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed. Please try again.");
    } else {
      onSuccess();
    }
  };

  return (
    <div className="space-y-5">
      {/* Express Checkout — Apple Pay / Google Pay big buttons */}
      <ExpressCheckoutElement
        onConfirm={handleExpressConfirm}
        options={{
          buttonHeight: 48,
          buttonType: {
            applePay: "buy",
            googlePay: "buy",
          },
        }}
      />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-[11px] text-zinc-600 font-medium">or pay with card</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      {/* Card payment form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <PaymentElement
          options={{
            layout: "tabs",
            wallets: { applePay: "never", googlePay: "never" },
          }}
        />

        {error && <p className="text-red-400 text-[13px]">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] font-medium text-zinc-400 hover:bg-white/[0.08] transition-colors disabled:opacity-40"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <button
            type="submit"
            disabled={!stripe || loading}
            className="shine flex-1 py-3.5 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: accentGradient }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Pay {currencySymbol}{price.toFixed(2)}
                <Lock className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CHECKOUT MODAL — 3-step in-modal payment
   Step 1: Email (username pre-filled from tunnel)
   Step 2: Stripe PaymentElement (card/Apple Pay/Google Pay)
   Step 3: Success
   ═══════════════════════════════════════════════════════════════ */
export default function CheckoutModal({
  isOpen,
  onClose,
  platform,
  tier,
  accentColor,
  accentGradient,
  username: prefillUsername = "",
  currencySymbol = "$",
}: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [username] = useState(prefillUsername);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const posthog = usePostHog();
  const platformLabel = platform === "instagram" ? "Instagram" : "TikTok";

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const resetAndClose = useCallback(() => {
    setStep(1);
    setEmail("");
    setError(null);
    setLoading(false);
    setClientSecret(null);
    onClose();
  }, [onClose]);

  // Step 1 → Step 2: create PaymentIntent, get clientSecret
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    posthog?.capture("checkout_submitted", {
      volume: tier.volume,
      price: tier.price,
      email: email.trim(),
      network: platform,
    });
    posthog?.identify(email.trim());

    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: tier.price,
          platform,
          package: `${tier.volume} AI Reach`,
          username: username.trim(),
          email: email.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setClientSecret(data.clientSecret);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 → Step 3: payment succeeded
  const handlePaymentSuccess = async () => {
    const orderId = `VPX-${Date.now().toString(36).toUpperCase()}`;

    posthog?.capture("payment_success", {
      volume: tier.volume,
      price: tier.price,
      network: platform,
      email: email.trim(),
      username: username.trim(),
    });

    trackGoogleAdsPurchase({
      value: tier.price,
      currency: currencySymbol === "€" ? "EUR" : currencySymbol === "£" ? "GBP" : currencySymbol === "CA$" ? "CAD" : currencySymbol === "AU$" ? "AUD" : "USD",
      transactionId: orderId,
    });

    setStep(3);

    // Fire order notifications (email, Discord, DB) in background
    try {
      await fetch("/api/order-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          email: email.trim(),
          username: username.trim(),
          platform,
          service: "AI Reach",
          quantity: tier.volume,
          price: tier.price,
          currency: "USD",
        }),
      });
    } catch (err) {
      console.error("Failed to process order notifications:", err);
    }
  };

  // Step indicators
  const stepLabels = ["Info", "Payment", "Done"];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            onClick={resetAndClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] as const }}
            className="relative w-full max-w-[440px] mx-4 sm:mx-auto bg-zinc-950 border border-white/[0.1] rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/50 overflow-hidden max-h-[90dvh] overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={resetAndClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* ── Header ── */}
            <div className="px-6 pt-6 pb-5 border-b border-white/[0.06]">
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500">
                {step === 3 ? "Order confirmed" : "Complete your setup"}
              </p>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-[28px] font-semibold text-white tracking-tight">
                  {currencySymbol}{tier.price.toFixed(2)}
                </span>
                <span className="text-[13px] text-zinc-600 line-through">
                  {currencySymbol}{tier.originalPrice.toFixed(2)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
                <span className="text-[13px] text-zinc-400">
                  {platformLabel} {tier.volume} AI Reach
                </span>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-1.5 mt-4">
                {stepLabels.map((label, i) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        step > i + 1
                          ? "text-white"
                          : step === i + 1
                            ? "text-white"
                            : "bg-white/[0.04] text-zinc-600"
                      }`}
                      style={
                        step >= i + 1
                          ? { backgroundColor: accentColor }
                          : undefined
                      }
                    >
                      {step > i + 1 ? "✓" : i + 1}
                    </div>
                    <span
                      className={`text-[10px] font-medium ${
                        step >= i + 1 ? "text-zinc-300" : "text-zinc-600"
                      }`}
                    >
                      {label}
                    </span>
                    {i < 2 && (
                      <div
                        className={`w-6 h-px mx-0.5 ${
                          step > i + 1 ? "bg-white/20" : "bg-white/[0.06]"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Body ── */}
            <div className="px-6 py-6">
              {/* ── Step 1: Username + Email ── */}
              {step === 1 && (
                <form onSubmit={handleInfoSubmit} className="space-y-4">
                  {/* Username from tunnel (read-only display) */}
                  {username && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                      <span className="text-[12px] font-medium text-zinc-500">Account</span>
                      <span className="text-[14px] font-semibold text-white">@{username}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[12px] font-medium text-zinc-400 mb-2">
                      Contact Email (for receipt &amp; tracking)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[14px] text-white placeholder:text-zinc-600 focus:border-white/[0.2] focus:ring-2 focus:outline-none transition-all"
                      style={{ ["--tw-ring-color" as string]: `${accentColor}30` } as React.CSSProperties}
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-[13px]">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="shine relative w-full py-4 rounded-2xl text-[14px] font-semibold text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
                    style={{ background: accentGradient }}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Continue to Payment
                        <Lock className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ── Step 2: Stripe PaymentElement ── */}
              {step === 2 && clientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "night",
                      variables: {
                        colorPrimary: accentColor,
                        colorBackground: "#18181b",
                        colorText: "#e4e4e7",
                        colorTextPlaceholder: "#52525b",
                        colorDanger: "#ef4444",
                        borderRadius: "12px",
                        fontFamily: "Inter, system-ui, sans-serif",
                        spacingUnit: "4px",
                      },
                      rules: {
                        ".Input": {
                          backgroundColor: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          padding: "14px 16px",
                        },
                        ".Input:focus": {
                          border: "1px solid rgba(255,255,255,0.2)",
                          boxShadow: `0 0 0 2px ${accentColor}30`,
                        },
                        ".Tab": {
                          backgroundColor: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        },
                        ".Tab--selected": {
                          backgroundColor: "rgba(255,255,255,0.08)",
                          border: `1px solid ${accentColor}60`,
                        },
                        ".Label": {
                          fontSize: "12px",
                          fontWeight: "500",
                        },
                      },
                    },
                  }}
                >
                  <PaymentForm
                    onSuccess={handlePaymentSuccess}
                    onBack={() => setStep(1)}
                    accentGradient={accentGradient}
                    accentColor={accentColor}
                    price={tier.price}
                    currencySymbol={currencySymbol}
                  />
                </Elements>
              )}

              {/* ── Step 3: Success ── */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <CheckCircle2 className="w-7 h-7" style={{ color: accentColor }} />
                  </div>
                  <h4 className="text-[20px] font-semibold text-white mb-1.5">
                    Payment Successful!
                  </h4>
                  <p className="text-[13px] text-zinc-400 mb-1">
                    {platformLabel} {tier.volume} AI Reach campaign is now active for
                  </p>
                  <p className="text-[15px] font-semibold text-white mb-1">
                    @{username}
                  </p>
                  <p className="text-[11px] text-zinc-600 mb-6">
                    Confirmation sent to {email}
                  </p>
                  <button
                    onClick={resetAndClose}
                    className="px-8 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-[13px] font-semibold hover:bg-white/[0.1] transition-colors"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </div>

            {/* ── Footer — Trust badges ── */}
            {step !== 3 && (
              <div className="px-6 pb-6 pt-2">
                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-600">
                  <Shield className="w-3 h-3" />
                  <span>Encrypted &amp; Secure</span>
                  <span className="mx-1.5 text-zinc-800">·</span>
                  <div className="flex items-center gap-1.5">
                    {["Apple Pay", "Google Pay", "Visa", "MC"].map((m) => (
                      <span
                        key={m}
                        className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] font-medium text-[9px]"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
