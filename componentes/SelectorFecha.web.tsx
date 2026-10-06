import React, { createElement } from 'react';

import { AUTOFOCUS_WEB } from '@/constantes/plataforma';
import { Radius, useAppTheme, useTheme } from '@/constantes/tema';
import { esFechaISOValida, type SelectorFechaProps } from './SelectorFecha.utils';

export { aFechaISO } from './SelectorFecha.utils';
export type { SelectorFechaProps } from './SelectorFecha.utils';

// @react-native-community/datetimepicker no soporta web: usamos el <input type="date"> del navegador.
export default function SelectorFecha({ value, onChange, onCerrar }: SelectorFechaProps) {
  const C = useTheme();
  const { isDark } = useAppTheme();
  return createElement('input', {
    type: 'date',
    value,
    'aria-label': 'Seleccionar fecha',
    autoFocus: AUTOFOCUS_WEB,
    onChange: (e: any) => {
      const nuevo: string = e.target.value;
      // Los cambios parciales (valor vacio mientras se escribe) no cierran ni propagan.
      if (!esFechaISOValida(nuevo) || Number(nuevo.slice(0, 4)) < 1900) return;
      onChange(nuevo);
      onCerrar?.();
    },
    onKeyDown: (e: any) => {
      if (e.key === 'Escape') onCerrar?.();
    },
    style: {
      fontFamily: 'inherit',
      fontSize: 16,
      padding: 12,
      borderRadius: Radius.sm,
      border: `1px solid ${C.lineStrong}`,
      backgroundColor: C.surface,
      color: C.ink,
      colorScheme: isDark ? 'dark' : 'light',
      width: '100%',
      maxWidth: 320,
      boxSizing: 'border-box',
    },
  });
}
