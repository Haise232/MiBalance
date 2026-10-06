import { MaterialIcons } from '@expo/vector-icons';

// ─── Definición de pestañas compartida (barra flotante y barra lateral) ───────

export type Pestana = {
  routeName: string;
  /** Etiqueta completa (barra lateral). */
  label: string;
  /** Etiqueta abreviada para la barra flotante en móvil. */
  labelCorto: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

export const PESTANAS: Pestana[] = [
  { routeName: 'index', label: 'Inicio', labelCorto: 'Inicio', icon: 'home' },
  { routeName: 'movimientos', label: 'Movimientos', labelCorto: 'Movim.', icon: 'receipt-long' },
  { routeName: 'reportes', label: 'Reportes', labelCorto: 'Reportes', icon: 'bar-chart' },
  { routeName: 'yo', label: 'Ajustes', labelCorto: 'Yo', icon: 'person' },
];
