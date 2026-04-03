"use client";

import { useMemo, useEffect, useRef, useState, useCallback } from "react";
import { Users, Heart, Eye, ArrowRight, Sparkles, Lock, Clock, Shield, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePostHog } from "posthog-js/react";
import { useTiktokUpsellStore } from "@/store/useTiktokUpsellStore";
import { formatQty } from "@/config/tiktok-services";
import { formatCurrency } from "@/lib/currency";
import { useCurrency } from "@/context/CurrencyContext";
import { usePricingTiers, type ResolvedTier } from "@/hooks/usePricingTiers";

const TT_ACCENT = "#ee1d52";
const TT_GRADIENT = "linear-gradient(135deg, #69C9D0 0%, #ee1d52 100%)";
const IG_ACCENT = "#dd2a7b";
const IG_GRADIENT = "linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)";

const BUNDLE_DISCOUNT = 0.10;

/* ─── Quick Packs ─── */
interface QuickPack {
  label: string;
  tag: string;
  followers: number;
  likes: number;
  views: number;
}
const QUICK_PACKS: QuickPack[] = [
  { label: "Starter", tag: "Great to test", followers: 500, likes: 250, views: 0 },
  { label: "Growth", tag: "Most chosen", followers: 2500, likes: 1000, views: 5000 },
  { label: "Viral", tag: "Best value", followers: 10000, likes: 5000, views: 25000 },
];

/* ─── Delivery estimate ─── */
function deliveryLabel(qty: number): string {
  if (qty <= 0) return "";
  if (qty <= 500) return "~1-2h";
  if (qty <= 2500) return "~6-12h";
  return "12-24h";
}

/* ═══════════════════════════════════════════════════════════════
   SERVICE SLIDER — one slider per service that snaps to tier values
   ═══════════════════════════════════════════════════════════════ */
interface ServiceSliderProps {
  label: string;
  icon: React.ReactNode;
  tiers: ResolvedTier[];
  selectedQty: number;
  onSelect: (qty: number) => void;
  currency: string;
  color: string;
}

function ServiceSlider({ label, icon, tiers, selectedQty, onSelect, currency, color }: ServiceSliderProps) {
  // steps = [0, tier1.qty, tier2.qty, ...]
  const steps = useMemo(() => [0, ...tiers.map((t) => t.quantity)], [tiers]);
  const currentIdx = steps.indexOf(selectedQty);
  const sliderIdx = currentIdx >= 0 ? currentIdx : 0;

  const currentTier = tiers.find((t) => t.quantity === selectedQty);
  const isActive = selectedQty > 0;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const idx = parseInt(e.target.value);
      onSelect(steps[idx] ?? 0);
    },
    [steps, onSelect],
  );

  // Filled percentage for the track
  const pct = steps.length > 1 ? (sliderIdx / (steps.length - 1)) * 100 : 0;

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all duration-300 ${
        isActive ? "border-white/[0.12] bg-white/[0.03]" : "border-white/[0.06] bg-white/[0.02]"
      }`}
    >
      {/* Header row: icon + label | quantity + price */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ backgroundColor: isActive ? `${color}20` : `${color}10` }}
          >
            {icon}
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-white">{label}</h3>
            {isActive && (
              <span className="text-[10px] text-zinc-500">Delivery: {deliveryLabel(selectedQty)}</span>
            )}
          </div>
        </div>

        {/* Dynamic quantity + price display */}
        <div className="text-right">
          {isActive && currentTier ? (
            <>
              <p className="text-[18px] font-bold text-white leading-tight">{formatQty(selectedQty)}</p>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-[13px] font-semibold" style={{ color }}>{formatCurrency(currentTier.price, currency)}</span>
                {currentTier.discountPct >= 15 && (
                  <span className="text-[9px] font-bold text-emerald-400 px-1 rounded bg-emerald-500/10">
                    -{currentTier.discountPct}%
                  </span>
                )}
              </div>
            </>
          ) : (
            <p className="text-[14px] text-zinc-600 font-medium">None</p>
          )}
        </div>
      </div>

      {/* Slider */}
      <div className="relative px-1">
        <input
          type="range"
          min={0}
          max={steps.length - 1}
          value={sliderIdx}
          onChange={handleChange}
          className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, rgba(255,255,255,0.06) ${pct}%, rgba(255,255,255,0.06) 100%)`,
          }}
        />
        {/* Tick marks */}
        <div className="flex justify-between mt-1.5 px-0.5">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => onSelect(s)}
              className={`text-[9px] sm:text-[10px] transition-colors ${
                i === sliderIdx ? "font-bold" : "text-zinc-600 hover:text-zinc-400"
              }`}
              style={i === sliderIdx ? { color } : undefined}
            >
              {s === 0 ? "0" : formatQty(s)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton loader ─── */
function SkeletonLoader() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 animate-pulse">
      <div className="h-8 w-48 mx-auto rounded-full bg-white/[0.06]" />
      <div className="h-5 w-64 mx-auto rounded-lg bg-white/[0.04]" />
      {[1, 2, 3].map((n) => (
        <div key={n} className="rounded-2xl border border-white/[0.06] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.06]" />
              <div className="h-4 w-20 rounded bg-white/[0.06]" />
            </div>
            <div className="h-5 w-16 rounded bg-white/[0.06]" />
          </div>
          <div className="h-2 rounded-full bg-white/[0.04]" />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function BundleConfigurator() {
  const posthog = usePostHog();
  const { currency } = useCurrency();
  const {
    platform,
    profile,
    followersQty, setFollowersQty,
    likesQty, setLikesQty,
    viewsQty, setViewsQty,
    setStep,
  } = useTiktokUpsellStore();

  const isIG = platform === "instagram";
  const accent = isIG ? IG_ACCENT : TT_ACCENT;
  const gradient = isIG ? IG_GRADIENT : TT_GRADIENT;

  const { resolved, getTierPrice: getPrice, getOriginalPrice, loading } = usePricingTiers(currency);

  const followersTiers = isIG ? resolved.instagram : resolved.tiktok;
  const likesTiers = isIG ? resolved.instagramLikes : resolved.tiktokLikes;
  const viewsTiers = isIG ? resolved.instagramViews : resolved.tiktokViews;
  const followersPricingKey = isIG ? "instagram" as const : "tiktok" as const;
  const likesPricingKey = isIG ? "instagramLikes" as const : "tiktokLikes" as const;
  const viewsPricingKey = isIG ? "instagramViews" as const : "tiktokViews" as const;

  /* ─── Pre-select defaults on first load ─── */
  const didPreselect = useRef(false);
  useEffect(() => {
    if (loading || didPreselect.current) return;
    if (followersQty === 0 && followersTiers.length >= 2) {
      setFollowersQty(followersTiers[1].quantity);
    }
    if (likesQty === 0 && likesTiers.length >= 1) {
      setLikesQty(likesTiers[0].quantity);
    }
    if (viewsQty === 0 && viewsTiers.length >= 2) {
      setViewsQty(viewsTiers[1].quantity);
    }
    didPreselect.current = true;
  }, [loading, followersTiers]);

  /* ─── Micro-feedback state ─── */
  const [microFeedback, setMicroFeedback] = useState<string | null>(null);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const showFeedback = (msg: string) => {
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    setMicroFeedback(msg);
    feedbackTimeout.current = setTimeout(() => setMicroFeedback(null), 1800);
  };

  /* ─── Counts & pricing ─── */
  const serviceCount = (followersQty > 0 ? 1 : 0) + (likesQty > 0 ? 1 : 0) + (viewsQty > 0 ? 1 : 0);
  const hasBundleDiscount = serviceCount >= 2;

  const rawTotal = useMemo(() => {
    return (
      getPrice(followersPricingKey, followersQty) +
      getPrice(likesPricingKey, likesQty) +
      getPrice(viewsPricingKey, viewsQty)
    );
  }, [followersQty, likesQty, viewsQty, getPrice, followersPricingKey, likesPricingKey, viewsPricingKey]);

  const totalPrice = hasBundleDiscount
    ? Math.round(rawTotal * (1 - BUNDLE_DISCOUNT) * 100) / 100
    : rawTotal;

  const totalOriginal = useMemo(() => {
    return (
      getOriginalPrice(followersPricingKey, followersQty) +
      getOriginalPrice(likesPricingKey, likesQty) +
      getOriginalPrice(viewsPricingKey, viewsQty)
    );
  }, [followersQty, likesQty, viewsQty, getOriginalPrice, followersPricingKey, likesPricingKey, viewsPricingKey]);

  const totalSavings = totalOriginal > 0 ? Math.round((1 - totalPrice / totalOriginal) * 100) : 0;

  const hasSelection = followersQty > 0 || likesQty > 0 || viewsQty > 0;
  const needsLikesAssignment = likesQty > 0 && (profile?.posts?.length ?? 0) > 0;
  const needsViewsAssignment = viewsQty > 0 && (profile?.posts?.length ?? 0) > 0;

  /* ─── Animated total ─── */
  const prevTotal = useRef(totalPrice);
  const [displayTotal, setDisplayTotal] = useState(totalPrice);
  useEffect(() => {
    if (totalPrice === prevTotal.current) return;
    const from = prevTotal.current;
    const to = totalPrice;
    prevTotal.current = to;
    const duration = 300;
    const start = performance.now();
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayTotal(Math.round((from + (to - from) * eased) * 100) / 100);
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [totalPrice]);

  /* ─── Quick Pack apply ─── */
  const applyQuickPack = (pack: QuickPack) => {
    posthog?.capture("tiktok_quick_pack_selected", { pack: pack.label });
    setFollowersQty(pack.followers);
    setLikesQty(pack.likes);
    setViewsQty(pack.views);
    showFeedback(`${pack.label} Pack applied!`);
  };

  /* ─── Wrapped selectors with micro-feedback ─── */
  const selectFollowers = useCallback((qty: number) => {
    setFollowersQty(qty);
    if (qty > 0) showFeedback(`${formatQty(qty)} followers`);
    posthog?.capture("slider_changed", { service: "followers", quantity: qty, platform });
  }, [setFollowersQty, posthog, platform]);

  const selectLikes = useCallback((qty: number) => {
    setLikesQty(qty);
    if (qty > 0) showFeedback(`${formatQty(qty)} likes`);
    posthog?.capture("slider_changed", { service: "likes", quantity: qty, platform });
  }, [setLikesQty, posthog, platform]);

  const selectViews = useCallback((qty: number) => {
    setViewsQty(qty);
    if (qty > 0) showFeedback(`${formatQty(qty)} views`);
    posthog?.capture("slider_changed", { service: "views", quantity: qty, platform });
  }, [setViewsQty, posthog, platform]);

  const handleContinue = () => {
    posthog?.capture("bundle_configured", {
      platform,
      username: profile?.username,
      followers: followersQty,
      likes: likesQty,
      views: viewsQty,
      total_price: totalPrice,
      bundle_discount: hasBundleDiscount,
      services_count: serviceCount,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (needsLikesAssignment) {
      setStep("assignLikes");
    } else if (needsViewsAssignment) {
      setStep("assignViews");
    } else {
      setStep("recap");
    }
  };

  /* ─── Quick Pack prices ─── */
  const packPrices = useMemo(() => {
    return QUICK_PACKS.map((p) => {
      const raw = getPrice(followersPricingKey, p.followers) + getPrice(likesPricingKey, p.likes) + getPrice(viewsPricingKey, p.views);
      const sc = (p.followers > 0 ? 1 : 0) + (p.likes > 0 ? 1 : 0) + (p.views > 0 ? 1 : 0);
      return sc >= 2 ? Math.round(raw * (1 - BUNDLE_DISCOUNT) * 100) / 100 : raw;
    });
  }, [getPrice, followersPricingKey, likesPricingKey, viewsPricingKey]);

  if (loading) return <SkeletonLoader />;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-3 sm:mb-6">
        <div className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] mb-4">
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[12px] font-medium text-zinc-300">Build Your Growth Package</span>
        </div>
        <h2 className="text-[clamp(1.3rem,3vw,2rem)] font-semibold text-white tracking-tight">
          Choose what you need for{" "}
          <span className={`bg-gradient-to-r ${isIG ? "from-[#f58529] via-[#dd2a7b] to-[#8134af]" : "from-[#69C9D0] to-[#ee1d52]"} bg-clip-text text-transparent`}>
            @{profile?.username}
          </span>
        </h2>
        <p className="hidden sm:block mt-2 text-[14px] text-zinc-400 max-w-md mx-auto">
          Slide to set your quantities. Combine 2+ services for an extra 10% off.
        </p>
      </div>

      {/* ─── Quick Packs ─── */}
      {(
        <div className="mb-3 sm:mb-5">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium mb-2.5 text-center">Quick Packs</p>
          <div className="grid grid-cols-1 min-[400px]:grid-cols-3 gap-2">
            {QUICK_PACKS.map((pack, i) => (
              <button
                key={pack.label}
                onClick={() => applyQuickPack(pack)}
                className="relative group rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] p-3 text-center transition-all duration-200 hover:-translate-y-0.5"
              >
                {i > 0 && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-[1px] rounded-full text-[8px] font-bold uppercase tracking-wider text-white whitespace-nowrap"
                    style={{ background: gradient }}
                  >
                    {pack.tag}
                  </span>
                )}
                <span className="block text-[14px] font-semibold text-white mt-1">{pack.label}</span>
                <span className="block text-[10px] text-zinc-500 mt-0.5">
                  {pack.followers > 0 && `${formatQty(pack.followers)} foll.`}
                  {pack.likes > 0 && ` + ${formatQty(pack.likes)} likes`}
                  {pack.views > 0 && ` + ${formatQty(pack.views)} views`}
                </span>
                <span className="block text-[13px] font-bold text-white mt-1">{formatCurrency(packPrices[i], currency)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Bundle discount hint ─── */}
      {(
        <div className={`mb-4 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 ${
          hasBundleDiscount
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-white/[0.06] bg-white/[0.02]"
        }`}>
          {hasBundleDiscount ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[12px] font-medium text-emerald-400">Bundle discount active: -{Math.round(BUNDLE_DISCOUNT * 100)}% applied!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[12px] text-zinc-500">Select 2+ services to unlock <span className="font-semibold text-zinc-300">-{Math.round(BUNDLE_DISCOUNT * 100)}% bundle discount</span></span>
            </>
          )}
        </div>
      )}

      {/* ─── Micro feedback ─── */}
      <AnimatePresence>
        {microFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="flex justify-center mb-3"
          >
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[11px] font-medium text-emerald-400">
              {microFeedback}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Service sliders ─── */}
      <div className="space-y-3">
        <ServiceSlider
          label="Followers"
          icon={<Users className="w-4 h-4" style={{ color: accent }} />}
          tiers={followersTiers}
          selectedQty={followersQty}
          onSelect={selectFollowers}
          currency={currency}
          color={accent}
        />
        <ServiceSlider
          label="Likes"
          icon={<Heart className="w-4 h-4" style={{ color: accent }} />}
          tiers={likesTiers}
          selectedQty={likesQty}
          onSelect={selectLikes}
          currency={currency}
          color={accent}
        />
        <ServiceSlider
          label="Views"
          icon={<Eye className="w-4 h-4" style={{ color: accent }} />}
          tiers={viewsTiers}
          selectedQty={viewsQty}
          onSelect={selectViews}
          currency={currency}
          color={accent}
        />
      </div>

      {/* ─── Total + Continue (desktop) ─── */}
      <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-[12px] text-zinc-500 uppercase tracking-wider font-medium">Bundle Total</p>
          <div className="flex items-baseline gap-2.5">
            <p className="text-[22px] sm:text-[28px] font-bold text-white tracking-tight">
              {displayTotal > 0 ? formatCurrency(displayTotal, currency) : "\u2014"}
            </p>
            {totalOriginal > 0 && displayTotal > 0 && (
              <>
                <span className="text-[14px] text-zinc-600 line-through">{formatCurrency(totalOriginal, currency)}</span>
                <span className="text-[12px] font-bold text-emerald-400">-{totalSavings}%</span>
              </>
            )}
          </div>
          {hasSelection && (
            <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-500">
              {followersQty > 0 && <span>{formatQty(followersQty)} followers</span>}
              {likesQty > 0 && <span>+ {formatQty(likesQty)} likes</span>}
              {viewsQty > 0 && <span>+ {formatQty(viewsQty)} views</span>}
            </div>
          )}
          {hasSelection && (
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] text-zinc-600"><Shield className="w-3 h-3" /> Money-back guarantee</span>
              <span className="flex items-center gap-1 text-[10px] text-zinc-600"><Clock className="w-3 h-3" /> Delivery starts in minutes</span>
            </div>
          )}
        </div>
        <button
          onClick={handleContinue}
          disabled={!hasSelection}
          className="shine w-full sm:w-auto whitespace-nowrap inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-white text-[13px] sm:text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: gradient }}
        >
          <Lock className="w-3.5 h-3.5" />
          {hasSelection ? `Secure my bundle \u2014 ${formatCurrency(displayTotal, currency)}` : "Select a service"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
