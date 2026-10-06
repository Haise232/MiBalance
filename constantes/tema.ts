import { Platform } from 'react-native';

import { useAppTheme } from '@/contextos/TemaContexto';

// ─── Palette ────────────────────────────────────────────────────────────────

export const Palette = {
  light: {
    bg: '#eff2ec',
    surface: '#f6f8f2',
    surface2: '#e6ebe0',
    surface3: '#d8e0d0',
    line: 'rgba(60, 45, 30, 0.10)',
    lineStrong: 'rgba(60, 45, 30, 0.18)',
    ink: '#1f1a14',
    ink2: '#4a4036',
    ink3: '#7a6e60',
    ink4: '#a89c8c',
    accent: '#6c8d6c',
    accentSoft: '#eef2ee',
    pos: '#5b8c5b',
    posSoft: '#eef4ee',
    neg: '#b85c3a',
    negSoft: '#f5ece8',
    warn: '#c49a2a',
    warnSoft: '#f5f0e0',
  },
  dark: {
    bg: '#10130e',
    surface: '#181c14',
    surface2: '#20251c',
    surface3: '#2a3024',
    line: 'rgba(255, 240, 220, 0.08)',
    lineStrong: 'rgba(255, 240, 220, 0.16)',
    ink: '#f3ece1',
    ink2: '#d4c9b8',
    ink3: '#a89c8a',
    ink4: '#756a5b',
    accent: '#8db08d',
    accentSoft: '#1c241c',
    pos: '#8db08d',
    posSoft: '#1c241c',
    neg: '#d4785a',
    negSoft: '#2a1510',
    warn: '#d4a84a',
    warnSoft: '#26200e',
  },
};

// ─── Typography ──────────────────────────────────────────────────────────────

export const Fonts = Platform.select({
  ios: {
    serif: 'Georgia',
    sans: 'System',
    mono: 'ui-monospace',
    rounded: 'ui-rounded',
  },
  web: {
    serif: "Georgia, 'Times New Roman', Times, serif",
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    rounded: "ui-rounded, 'SF Pro Rounded', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  default: {
    serif: 'serif',
    sans: 'normal',
    mono: 'monospace',
    rounded: 'normal',
  },
})!;

// ─── Spacing & Radius ────────────────────────────────────────────────────────

export const Radius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 100,
} as const;

// ─── Category Glyphs ─────────────────────────────────────────────────────────

export const CATEGORY_GLYPHS: Record<string, string> = {
  Comida: '◉',
  Transporte: '→',
  Salario: '✦',
  Alquiler: '◧',
  Suscripciones: '◔',
  Ocio: '◎',
  Salud: '+',
  Ahorro: '◆',
  Mercado: '◰',
  Servicios: '◌',
  Freelance: '✶',
  Otros: '·',
  Inversión: '◈',
  Regalo: '◇',
  // legacy mappings
  Entretenimiento: '◎',
  Ropa: '◌',
  Otro: '·',
};

// ─── ThemeColors type ─────────────────────────────────────────────────────────

export type ThemeColors = {
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  line: string;
  lineStrong: string;
  ink: string;
  ink2: string;
  ink3: string;
  ink4: string;
  accent: string;
  accentSoft: string;
  pos: string;
  posSoft: string;
  neg: string;
  negSoft: string;
  warn: string;
  warnSoft: string;
};

// ─── useTheme hook ───────────────────────────────────────────────────────────

export { useAppTheme } from '@/contextos/TemaContexto';

export function useTheme(): ThemeColors {
  const { isDark } = useAppTheme();
  return isDark ? Palette.dark : Palette.light;
}

// ─── Web paper-grain texture ──────────────────────────────────────────────────
// A flat fill reads as a mobile-app screen; a faint grain gives the web pages a
// printed, tactile quality that matches the brand's serif/earthy identity.
// Native ignores it (backgroundImage isn't a native style prop); web renders it.

function grainDataUri(rgb: string, alpha: number): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>
    <filter id='n'>
      <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>
      <feColorMatrix type='matrix' values='0 0 0 0 ${rgb}  0 0 0 0 ${rgb}  0 0 0 0 ${rgb}  0 0 0 ${alpha} 0'/>
    </filter>
    <rect width='100%' height='100%' filter='url(#n)'/>
  </svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const WEB_TEXTURE = Platform.OS === 'web' ? {
  light: { backgroundImage: grainDataUri('0.10', 0.05), backgroundRepeat: 'repeat' } as any,
  dark:  { backgroundImage: grainDataUri('0.96', 0.04), backgroundRepeat: 'repeat' } as any,
} : null;

export function useWebTexture(): any {
  const { isDark } = useAppTheme();
  if (!WEB_TEXTURE) return null;
  return isDark ? WEB_TEXTURE.dark : WEB_TEXTURE.light;
}
