"use client";

import { useId } from "react";

interface IconProps {
  className?: string;
}

export function InstagramIcon({ className = "w-6 h-6" }: IconProps) {
  const id = useId();
  const gradId = `ig-grad-${id}`;
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="24" x2="24" y2="0">
          <stop offset="0%" stopColor="#feda75" />
          <stop offset="20%" stopColor="#fa7e1e" />
          <stop offset="40%" stopColor="#d62976" />
          <stop offset="60%" stopColor="#962fbf" />
          <stop offset="100%" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" stroke={`url(#${gradId})`} strokeWidth="2" />
      <circle cx="12" cy="12" r="5" stroke={`url(#${gradId})`} strokeWidth="2" />
      <circle cx="18" cy="6" r="1.5" fill={`url(#${gradId})`} />
    </svg>
  );
}

export function TikTokIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.17a8.16 8.16 0 0 0 4.76 1.53v-3.5a4.82 4.82 0 0 1-1-.51z" />
    </svg>
  );
}

