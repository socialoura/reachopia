"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const activities = [
  { name: "Alex", city: "Paris", action: "started an AI Growth Campaign" },
  { name: "Sarah", city: "London", action: "activated Instagram Growth" },
  { name: "Marco", city: "Milan", action: "launched a TikTok Campaign" },
  { name: "Emily", city: "New York", action: "started an AI Growth Campaign" },
  { name: "Yuki", city: "Tokyo", action: "activated Instagram Growth" },
  { name: "Lucas", city: "Berlin", action: "launched a TikTok Campaign" },
  { name: "Sofia", city: "Madrid", action: "started an AI Growth Campaign" },
  { name: "James", city: "Sydney", action: "activated Instagram Growth" },
  { name: "Léa", city: "Montreal", action: "launched a TikTok Campaign" },
  { name: "Omar", city: "Dubai", action: "started an AI Growth Campaign" },
];

export default function LiveActivityToast() {
  const [current, setCurrent] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const initialDelay = setTimeout(() => {
      showNext(0);
    }, 6000);

    return () => clearTimeout(initialDelay);
  }, []);

  const showNext = (index: number) => {
    setCurrent(index);
    setVisible(true);

    setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        const next = (index + 1) % activities.length;
        showNext(next);
      }, 8000 + Math.random() * 7000);
    }, 4000);
  };

  const activity = current !== null ? activities[current] : null;

  return (
    <AnimatePresence>
      {visible && activity && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-20 md:bottom-6 left-4 z-30 max-w-[280px] hidden md:block"
        >
          <div className="bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-white">
                {activity.name[0]}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-white truncate">
                {activity.name} from {activity.city}
              </p>
              <p className="text-[11px] text-zinc-400 truncate">
                {activity.action}
              </p>
              <p className="text-[10px] text-zinc-600 mt-0.5">Just now</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
