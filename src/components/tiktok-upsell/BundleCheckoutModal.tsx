"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, ExpressCheckoutElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { X, Lock, Shield, Loader2, CheckCircle2, Users, Heart, Eye, Star, ArrowRight } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { trackGoogleAdsPurchase } from "@/lib/track-google-ads";
import { formatCurrency } from "@/lib/currency";
import { useTiktokUpsellStore } from "@/store/useTiktokUpsellStore";
import { formatQty } from "@/config/tiktok-services";
import { useCurrency } from "@/context/CurrencyContext";
import { usePricingTiers } from "@/hooks/usePricingTiers";

const TT_ACCENT = "#ee1d52";
const TT_GRADIENT = "linear-gradient(135deg, #69C9D0 0%, #ee1d52 100%)";
const IG_GRADIENT = "linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)";
const BUNDLE_DISCOUNT = 0.10;

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

/* ─── Confetti Effect ─── */
function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = ["#ee1d52", "#69C9D0", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6"];
    const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; rotation: number; rv: number }[] = [];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 100,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 10 - 4,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rv: (Math.random() - 0.5) * 0.3,
      });
    }

    let frame = 0;
    const animate = () => {
      if (frame > 120) return;
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.vx *= 0.99;
        p.rotation += p.rv;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - frame / 120);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />;
}

/* ─── Inner Payment Form ─── */
function PaymentForm({
  onCardSuccess,
  onExpressSuccess,
  price,
  currency,
  email,
  onEmailError,
}: {
  onCardSuccess: () => void;
  onExpressSuccess: () => void;
  price: number;
  currency?: string;
  email: string;
  onEmailError: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { platform } = useTiktokUpsellStore();
  const payGradient = platform === "instagram" ? IG_GRADIENT : TT_GRADIENT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (submitError) {
      setError(submitError.message || "Payment failed. Please try again.");
      setLoading(false);
    } else {
      setLoading(false);
      onCardSuccess();
    }
  };

  const handleExpressConfirm = async () => {
    if (!stripe || !elements) return;
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });
    if (confirmError) {
      setError(confirmError.message || "Payment failed. Please try again.");
    } else {
      onExpressSuccess();
    }
  };

  return (
    <div className="space-y-4">
      <ExpressCheckoutElement
        onConfirm={handleExpressConfirm}
        options={{ buttonHeight: 48, buttonType: { applePay: "buy", googlePay: "buy" } }}
      />
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-[11px] text-zinc-600 font-medium">or pay with card</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement options={{ layout: "tabs", wallets: { applePay: "never", googlePay: "never" } }} />
        {error && <p className="text-red-400 text-[13px]">{error}</p>}
        <button
          type="submit"
          disabled={!stripe || loading}
          className="shine w-full py-4 rounded-2xl text-[14px] font-semibold text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: payGradient }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              Pay {formatCurrency(price, currency || "USD")} Securely
            </>
          )}
        </button>
      </form>
    </div>
  );
}

/* ─── Bundle Checkout Modal ─── */
export default function BundleCheckoutModal() {
  const posthog = usePostHog();
  const { currency } = useCurrency();
  const {
    platform,
    checkoutOpen,
    setCheckoutOpen,
    profile,
    followersQty,
    likesQty,
    viewsQty,
    likesAssignments,
    viewsAssignments,
    reset,
  } = useTiktokUpsellStore();

  const isIG = platform === "instagram";
  const accent = isIG ? "#dd2a7b" : TT_ACCENT;
  const gradient = isIG ? IG_GRADIENT : TT_GRADIENT;

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const { getTierPrice: getPrice } = usePricingTiers(currency);
  const followersPrice = isIG ? getPrice("instagram", followersQty) : getPrice("tiktok", followersQty);
  const likesPrice = isIG ? getPrice("instagramLikes", likesQty) : getPrice("tiktokLikes", likesQty);
  const viewsPrice = isIG ? getPrice("instagramViews", viewsQty) : getPrice("tiktokViews", viewsQty);

  const serviceCount = (followersQty > 0 ? 1 : 0) + (likesQty > 0 ? 1 : 0) + (viewsQty > 0 ? 1 : 0);
  const hasBundleDiscount = serviceCount >= 2;
  const rawTotal = Math.round((followersPrice + likesPrice + viewsPrice) * 100) / 100;
  const totalPrice = hasBundleDiscount
    ? Math.round(rawTotal * (1 - BUNDLE_DISCOUNT) * 100) / 100
    : rawTotal;

  const username = profile?.username ?? "";

  // Build description string
  const parts: string[] = [];
  if (followersQty > 0) parts.push(`${formatQty(followersQty)} Followers`);
  if (likesQty > 0) parts.push(`${formatQty(likesQty)} Likes`);
  if (viewsQty > 0) parts.push(`${formatQty(viewsQty)} Views`);
  const packageDesc = parts.join(" + ");

  // Lock body scroll
  useEffect(() => {
    if (checkoutOpen) { document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [checkoutOpen]);

  // Create PaymentIntent
  useEffect(() => {
    if (!checkoutOpen || clientSecret) return;
    const createIntent = async () => {
      try {
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalPrice,
            platform,
            package: packageDesc,
            username: username.trim(),
            email: "",
            currency,
          }),
        });
        const data = await res.json();
        if (res.ok && data.clientSecret) setClientSecret(data.clientSecret);
      } catch (err) {
        console.error("Failed to create payment intent:", err);
      }
    };
    createIntent();
  }, [checkoutOpen, totalPrice, packageDesc, username, currency, clientSecret]);

  const resetAndClose = useCallback(() => {
    setStep(1);
    setEmail("");
    setError(null);
    setClientSecret(null);
    setCheckoutOpen(false);
  }, [setCheckoutOpen]);

  const processPaymentSuccess = async (customerEmail: string) => {
    const orderId = `VPX-${Date.now().toString(36).toUpperCase()}`;

    posthog?.capture("bundle_payment_success", {
      platform,
      followers: followersQty,
      likes: likesQty,
      views: viewsQty,
      total_price: totalPrice,
      email: customerEmail,
      username: username.trim(),
    });
    posthog?.identify(customerEmail);

    trackGoogleAdsPurchase({
      value: totalPrice,
      currency: currency || "USD",
      transactionId: orderId,
    });

    setStep(2);

    // Save order via existing API
    try {
      const quantityParts: string[] = [];
      if (followersQty > 0) quantityParts.push(`${followersQty} followers`);
      if (likesQty > 0) quantityParts.push(`${likesQty} likes`);
      if (viewsQty > 0) quantityParts.push(`${viewsQty} views`);

      await fetch("/api/order-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          email: customerEmail,
          username: username.trim(),
          platform,
          service: isIG ? "Instagram Bundle" : "TikTok Bundle",
          quantity: quantityParts.join(" + "),
          price: totalPrice,
          currency: currency || "USD",
          followersQty,
          likesQty,
          viewsQty,
          assignments: {
            likes: likesAssignments.length > 0 ? likesAssignments.map(a => ({ postId: a.postId, quantity: a.quantity, imageUrl: a.imageUrl })) : undefined,
            views: viewsAssignments.length > 0 ? viewsAssignments.map(a => ({ postId: a.postId, quantity: a.quantity, imageUrl: a.imageUrl })) : undefined,
          },
        }),
      });
    } catch (err) {
      console.error("Failed to process order:", err);
    }
  };

  const handleCardSuccess = async () => {
    await processPaymentSuccess(email.trim() || `card-${Date.now()}@checkout.pay`);
  };

  const handleExpressSuccess = async () => {
    const customerEmail = email.trim() || `express-${Date.now()}@wallet.pay`;
    await processPaymentSuccess(customerEmail);
  };

  return (
    <AnimatePresence>
      {checkoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            onClick={resetAndClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] as const }}
            className="relative w-full max-w-[460px] mx-4 sm:mx-auto bg-zinc-950 border border-white/[0.1] rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/50 overflow-hidden max-h-[90dvh] overflow-y-auto"
          >
            {/* Confetti on success */}
            {step === 2 && <ConfettiCanvas />}

            <button
              onClick={resetAndClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b border-white/[0.06]">
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500">
                {step === 2 ? "Order confirmed" : "Complete your purchase"}
              </p>
              <div className="mt-3 flex items-baseline gap-2 sm:gap-3">
                <span className="text-[22px] sm:text-[28px] font-semibold text-white tracking-tight">
                  {formatCurrency(totalPrice, currency)}
                </span>
                {hasBundleDiscount && (
                  <span className="text-[12px] font-bold text-emerald-400">-{Math.round(BUNDLE_DISCOUNT * 100)}% bundle</span>
                )}
              </div>
              {/* What you get */}
              <div className="mt-3 space-y-1.5">
                <p className="text-[11px] text-zinc-500 font-medium">Your @{username} will gain:</p>
                {followersQty > 0 && (
                  <p className="flex items-center gap-2 text-[12px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-white font-medium">{formatQty(followersQty)} New Followers</span>
                  </p>
                )}
                {likesQty > 0 && (
                  <p className="flex items-center gap-2 text-[12px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-white font-medium">{formatQty(likesQty)} Likes</span>
                    {likesAssignments.length > 0 && <span className="text-zinc-500">across {likesAssignments.length} videos</span>}
                  </p>
                )}
                {viewsQty > 0 && (
                  <p className="flex items-center gap-2 text-[12px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-white font-medium">{formatQty(viewsQty)} Views</span>
                    {viewsAssignments.length > 0 && <span className="text-zinc-500">across {viewsAssignments.length} videos</span>}
                  </p>
                )}
                <p className="flex items-center gap-2 text-[12px] text-zinc-500">
                  <Loader2 className="w-3.5 h-3.5 text-zinc-600" />
                  Delivery starts within 5 minutes
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              {step === 1 && (
                <div className="space-y-5">
                  {/* Email — optional with hint */}
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-400 mb-2">
                      Email <span className="text-zinc-600">(optional &mdash; we&apos;ll send your receipt here)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[14px] text-white placeholder:text-zinc-600 focus:border-white/[0.2] focus:ring-2 focus:outline-none transition-all"
                      style={{ ["--tw-ring-color" as string]: `${accent}30` } as React.CSSProperties}
                    />
                  </div>

                  {error && <p className="text-red-400 text-[13px]">{error}</p>}

                  {clientSecret ? (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: "night",
                          variables: {
                            colorPrimary: accent,
                            colorBackground: "#18181b",
                            colorText: "#e4e4e7",
                            colorTextPlaceholder: "#52525b",
                            colorDanger: "#ef4444",
                            borderRadius: "12px",
                            fontFamily: "Inter, system-ui, sans-serif",
                            spacingUnit: "4px",
                          },
                          rules: {
                            ".Input": { backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "14px 16px" },
                            ".Input:focus": { border: "1px solid rgba(255,255,255,0.2)", boxShadow: `0 0 0 2px ${accent}30` },
                            ".Tab": { backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" },
                            ".Tab--selected": { backgroundColor: "rgba(255,255,255,0.08)", border: `1px solid ${accent}60` },
                            ".Label": { fontSize: "12px", fontWeight: "500" },
                          },
                        },
                      }}
                    >
                      <PaymentForm
                        onCardSuccess={handleCardSuccess}
                        onExpressSuccess={handleExpressSuccess}
                        price={totalPrice}
                        currency={currency}
                        email={email}
                        onEmailError={() => setError("Please enter your email address")}
                      />
                    </Elements>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                    </div>
                  )}
                </div>
              )}

              {/* Success */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4 relative z-20"
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${accent}33` }}>
                    <CheckCircle2 className="w-7 h-7" style={{ color: accent }} />
                  </div>
                  <h4 className="text-[20px] font-semibold text-white mb-1.5">Payment Successful!</h4>
                  <p className="text-[13px] text-zinc-400 mb-1">
                    {packageDesc} for <span className="text-white font-medium">@{username}</span>
                  </p>
                  {email && (
                    <p className="text-[11px] text-zinc-600 mb-4">
                      Confirmation sent to {email}
                    </p>
                  )}

                  {/* Post-purchase upsell */}
                  <div className="mt-4 mb-4 p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] text-left">
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium mb-2">Boost even more</p>
                    <button
                      onClick={() => {
                        posthog?.capture("post_purchase_upsell_click", { platform });
                        resetAndClose();
                        reset();
                        window.location.href = "/pricing2";
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: gradient }}>
                          <Users className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-[12px] font-medium text-white">{isIG ? "Add more Instagram followers" : "Add more TikTok growth"}</p>
                          <p className="text-[10px] text-zinc-500">Get 20% off your next order</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                    </button>

                    {/* Cross-sell to the other platform */}
                    <button
                      onClick={() => {
                        posthog?.capture("post_purchase_crosssell", { from: platform, to: isIG ? "tiktok" : "instagram" });
                        resetAndClose();
                        reset();
                        window.location.href = "/pricing2";
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all group mt-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: isIG ? TT_GRADIENT : IG_GRADIENT }}>
                          {isIG ? (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white"><path d="M16.6 5.82A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" /></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white"><rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-[12px] font-medium text-white">{isIG ? "Also on TikTok?" : "Also on Instagram?"}</p>
                          <p className="text-[10px] text-zinc-500">Get 15% off your first boost</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                    </button>
                  </div>

                  <button
                    onClick={() => { resetAndClose(); reset(); }}
                    className="px-8 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-[13px] font-semibold hover:bg-white/[0.1] transition-colors"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </div>

            {/* Footer trust */}
            {step === 1 && (
              <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-2">
                <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-600 flex-wrap">
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Money-back guarantee</span>
                  <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Encrypted &amp; Secure</span>
                  <img src="/badges_paiement.png" alt="Payment methods" className="h-4 w-auto opacity-60" />
                </div>
                <div className="flex items-center justify-center gap-0.5 mt-2">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-[9px] text-zinc-600 ml-1">47,291 orders completed</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
