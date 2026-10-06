import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { ES_WEB } from '@/constantes/plataforma';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { Radius, useTheme } from '@/constantes/tema';

/**
 * Acciones de fila visibles al pasar el ratón (solo web).
 *
 * En nativo las filas usan gestos de deslizamiento (Swipeable); con ratón esos
 * gestos son difíciles de descubrir, así que en web mostramos botones compactos
 * cuando la fila está en hover o cuando alguno de sus botones tiene el foco del
 * teclado (Tab).
 */


export type TonoAccion = 'neutral' | 'accent' | 'neg';

export interface AccionFila {
  /** Nombre de icono de MaterialIcons (p. ej. 'edit', 'delete-outline', 'payments'). */
  icono: React.ComponentProps<typeof MaterialIcons>['name'];
  /** Texto accesible y tooltip (p. ej. "Editar", "Eliminar"). */
  etiqueta: string;
  onPress: () => void;
  tono?: TonoAccion;
}

// ─── Botón individual ─────────────────────────────────────────────────────────

interface BotonAccionProps {
  accion: AccionFila;
  onFocusChange?: (focused: boolean) => void;
}

function BotonAccion({ accion, onFocusChange }: BotonAccionProps) {
  const C = useTheme();
  const [hover, setHover] = useState(false);
  const tono = accion.tono ?? 'neutral';

  const colorIcono = tono === 'neg' ? C.neg : tono === 'accent' ? C.accent : C.ink3;
  const fondoHover = tono === 'neg' ? C.negSoft : tono === 'accent' ? C.accentSoft : C.surface3;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accion.etiqueta}
      // `title` muestra el tooltip nativo del navegador en react-native-web.
      {...(ES_WEB ? ({ title: accion.etiqueta } as object) : null)}
      onPress={accion.onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      onFocus={() => onFocusChange?.(true)}
      onBlur={() => onFocusChange?.(false)}
      hitSlop={8}
      style={({ pressed }) => [
        s.boton,
        ES_WEB && s.cursor,
        (hover || pressed) && { backgroundColor: fondoHover },
        pressed && s.botonPresionado,
      ]}
    >
      <MaterialIcons name={accion.icono} size={18} color={colorIcono} />
    </Pressable>
  );
}

// ─── Ranura de acciones (inline) ──────────────────────────────────────────────

const TAM_BOTON = 30;
const HUECO = 4;

/** Ancho fijo reservado para `n` botones (sin saltos de layout al hacer hover). */
export function anchoAcciones(n: number): number {
  return n > 0 ? n * TAM_BOTON + (n - 1) * HUECO : 0;
}

interface AccionesHoverProps {
  acciones: AccionFila[];
  visible: boolean;
  onFocusChange?: (focused: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Ranura inline de ancho fijo: siempre ocupa su espacio en web, pero solo es
 * visible (opacidad 1) con hover/foco. Así no tapa nada ni desplaza el layout.
 */
export function AccionesHover({ acciones, visible, onFocusChange, style }: AccionesHoverProps) {
  if (acciones.length === 0) return null;

  return (
    <View
      // Se mantiene montada (opacidad 0) para que los botones sigan siendo
      // alcanzables con Tab; al recibir foco la ranura se hace visible.
      pointerEvents={visible ? 'auto' : 'none'}
      style={[s.ranura, { width: anchoAcciones(acciones.length), opacity: visible ? 1 : 0 }, style]}
    >
      {acciones.map((a) => (
        <BotonAccion key={a.etiqueta} accion={a} onFocusChange={onFocusChange} />
      ))}
    </View>
  );
}

// ─── Contenedor de fila con hover ─────────────────────────────────────────────

interface FilaHoverProps {
  /** Acciones a mostrar; las entradas `null`/`false`/`undefined` se ignoran. */
  acciones: (AccionFila | null | false | undefined)[];
  /**
   * Render de la fila. Recibe si está activa (hover/foco) y la ranura de
   * acciones, que el llamador coloca inline (p. ej. tras el importe).
   * En nativo: `activa` es false y `ranura` es null.
   */
  children: (activa: boolean, ranura: React.ReactNode) => React.ReactNode;
  /** Si existe, la fila entera es pulsable (cursor pointer). */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * En web detecta hover/foco sobre la fila y construye la ranura de acciones.
 * En nativo solo renderiza el contenido (las acciones siguen en el swipe).
 */
export function FilaHover({ acciones, children, onPress, style }: FilaHoverProps) {
  const [hover, setHover] = useState(false);
  const [foco, setFoco] = useState(false);
  const onFocusChange = useCallback((f: boolean) => setFoco(f), []);

  if (!ES_WEB) return <>{children(false, null)}</>;

  const activa = hover || foco;
  const lista = acciones.filter(Boolean) as AccionFila[];
  const ranura = <AccionesHover acciones={lista} visible={activa} onFocusChange={onFocusChange} />;
  const contenido = children(activa, ranura);

  // Fila pulsable → Pressable (cursor pointer). Si no, un View con eventos de
  // puntero: así no se interfiere con la selección de texto con el ratón.
  if (onPress) {
    return (
      <Pressable
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        onPress={onPress}
        style={[s.cursor, style]}
      >
        {contenido}
      </Pressable>
    );
  }

  return (
    <View
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      style={style}
    >
      {contenido}
    </View>
  );
}

const s = StyleSheet.create({
  cursor: { cursor: 'pointer' },
  ranura: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: HUECO,
    flexShrink: 0,
  },
  boton: {
    width: TAM_BOTON,
    height: TAM_BOTON,
    borderRadius: Radius.sm - 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonPresionado: { opacity: 0.7 },
});
