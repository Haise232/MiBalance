// ─── Icon picker options ──────────────────────────────────────────────────────

export const SUBSCRIPTION_ICONS = [
  'subscriptions', 'movie', 'music-note', 'sports-esports', 'local-cafe',
  'fitness-center', 'cloud', 'wifi', 'phone', 'school',
  'newspaper', 'shopping-bag', 'tv', 'language', 'star',
] as const;

export type SubIcon = typeof SUBSCRIPTION_ICONS[number];

export type BillingCycle = 'monthly' | 'annual' | 'weekly';

export const CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: 'Mensual',
  annual: 'Anual',
  weekly: 'Semanal',
};
