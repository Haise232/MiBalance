export interface SelectorFechaProps {
  /** Fecha en formato YYYY-MM-DD */
  value: string;
  onChange: (fecha: string) => void;
  /** Se llama cuando el selector debe ocultarse (Android tras elegir/cancelar, web tras elegir) */
  onCerrar?: () => void;
}

export function aFechaISO(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** True solo para una fecha completa y real en formato YYYY-MM-DD. */
export function esFechaISOValida(valor: string | null | undefined): valor is string {
  if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const [y, m, d] = valor.split('-').map(Number);
  const f = new Date(y, m - 1, d);
  return f.getFullYear() === y && f.getMonth() === m - 1 && f.getDate() === d;
}
