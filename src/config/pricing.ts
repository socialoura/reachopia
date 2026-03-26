/* ═══════════════════════════════════════════════════════════════
   Pricing Configuration — Admin-editable constants
   Used by the ResultsModal for the exit-intent downsell offer.
   ═══════════════════════════════════════════════════════════════ */

export interface DownsellConfig {
  reachAmount: number;
  price: number;
  currency: string;
  ctaLabel: string;
  enabled: boolean;
}

export const downsellConfig: DownsellConfig = {
  reachAmount: 100,
  price: 1.90,
  currency: "$",
  ctaLabel: "Claim My Trial Pack",
  enabled: true,
};

/* ─── Social proof names for rotating notifications ─── */
export const SOCIAL_PROOF_NAMES = [
  "Alex", "Sarah", "Mike", "Emma", "Lucas", "Olivia",
  "Noah", "Sophia", "Liam", "Isabella", "James", "Mia",
  "Ethan", "Ava", "Daniel", "Charlotte", "Mason", "Amelia",
  "Logan", "Harper", "Léa", "Théo", "Jade", "Hugo",
];
