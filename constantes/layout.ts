// ─── Layout responsive compartido ───────────────────────────────────────────

/** Anchos mínimos (px) de cada clase de pantalla. */
export const Breakpoints = {
  movil: 0,
  tablet: 600,
  escritorio: 920,
} as const;

/** Anchos máximos (px) del contenido según el tipo de pantalla. */
export const AnchoMax = {
  formulario: 600,
  contenido: 760,
  lista: 640,
  auth: 440,
  tutorial: 420,
} as const;

export type ClaseDiseno = keyof typeof Breakpoints;
export type VarianteAncho = keyof typeof AnchoMax;
