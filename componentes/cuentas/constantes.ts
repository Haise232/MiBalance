import type { Account } from '@/servicios/baseDatos';

// ─── Constants ────────────────────────────────────────────────────────────────

export const TYPE_LABELS: Record<Account['type'], string> = {
  cash: 'Efectivo',
  bank: 'Banco',
  card: 'Tarjeta',
};

export const TYPE_ICONS: Record<Account['type'], string> = {
  cash: 'payments',
  bank: 'account-balance',
  card: 'credit-card',
};

export const ACCOUNT_TYPES: Account['type'][] = ['cash', 'bank', 'card'];
