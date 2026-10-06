import React from 'react';
import {
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { COMPORTAMIENTO_TECLADO, ES_WEB, MOSTRAR_BARRA_SCROLL } from '@/constantes/plataforma';
import { Radius, useTheme } from '@/constantes/tema';
import { useDiseno } from '@/hooks/useDiseno';

// ─── Dialogo ──────────────────────────────────────────────────────────────────
//
// Envoltorio de <Modal> que adapta la presentación al tamaño de pantalla:
//  · Pantallas estrechas (móvil): conserva la presentación original de cada
//    modal (hoja inferior, tarjeta centrada o pantalla completa "pageSheet").
//  · Tablet (600-919): misma presentación que móvil pero con ancho máximo
//    (`anchoMax`) centrado; las pantallas completas pasan a diálogo centrado.
//  · Pantallas anchas (escritorio): diálogo centrado con ancho máximo, bordes
//    redondeados y fondo atenuado; hacer clic en el fondo llama a `onClose`.
// Siempre pasa `onRequestClose`, por lo que Escape (web) y el botón atrás
// (Android) cierran el diálogo.

export type PresentacionDialogo = 'tarjeta' | 'pantalla';

interface DialogoProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /**
   * Presentación en móvil:
   *  · 'tarjeta' (por defecto): modal transparente; `estiloFondo` y `estiloCaja`
   *    definen si es una hoja inferior o una tarjeta centrada.
   *  · 'pantalla': modal nativo a pantalla completa (`pageSheet`, deslizando).
   */
  presentacion?: PresentacionDialogo;
  /** Estilo del fondo atenuado en móvil (p. ej. `justifyContent: 'flex-end'`). */
  estiloFondo?: StyleProp<ViewStyle>;
  /** Estilo de la caja de contenido (móvil y escritorio). */
  estiloCaja?: StyleProp<ViewStyle>;
  /** Ajustes extra de la caja sólo en escritorio. */
  estiloCajaAncho?: StyleProp<ViewStyle>;
  /** En móvil, cerrar al tocar el fondo (en escritorio siempre se cierra). */
  cerrarAlTocarFondo?: boolean;
  /** Envuelve el fondo en un KeyboardAvoidingView. */
  evitarTeclado?: boolean;
  comportamientoTeclado?: KeyboardAvoidingViewProps['behavior'];
  /** Contenido desplazable: la caja va dentro de un ScrollView. */
  desplazable?: boolean;
  anchoMax?: number;
  statusBarTranslucent?: boolean;
}

export default function Dialogo({
  visible,
  onClose,
  children,
  presentacion = 'tarjeta',
  estiloFondo,
  estiloCaja,
  estiloCajaAncho,
  cerrarAlTocarFondo = false,
  evitarTeclado = false,
  comportamientoTeclado = COMPORTAMIENTO_TECLADO,
  desplazable = false,
  anchoMax = 520,
  statusBarTranslucent,
}: DialogoProps) {
  const C = useTheme();
  const { esAncho: esEscritorio, esTablet } = useDiseno();
  // Diálogo centrado: escritorio, o tablet cuando el modal sería pantalla completa.
  const esAncho = esEscritorio || (esTablet && presentacion === 'pantalla');
  const limitarAncho = esTablet && !esAncho;

  // ── Móvil: pantalla completa nativa ──
  if (!esAncho && presentacion === 'pantalla') {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        {children}
      </Modal>
    );
  }

  const fondoPulsable = (esAncho || cerrarAlTocarFondo || ES_WEB) ? (
    <Pressable
      style={StyleSheet.absoluteFill}
      onPress={onClose}
      accessibilityRole="button"
      accessibilityLabel="Cerrar"
    />
  ) : null;

  let caja: React.ReactNode;
  if (esAncho && presentacion === 'pantalla') {
    caja = (
      <View
        style={[
          s.cajaPantallaAncho,
          { maxWidth: anchoMax, backgroundColor: C.bg, borderColor: C.line },
          estiloCajaAncho,
        ]}
      >
        {children}
      </View>
    );
  } else {
    caja = (
      <View
        style={[
          { backgroundColor: C.surface, borderColor: C.line },
          estiloCaja,
          limitarAncho && [s.cajaTablet, { maxWidth: anchoMax }],
          esAncho && [s.cajaAncho, { maxWidth: anchoMax }, !desplazable && s.cajaAnchoLimitada],
          esAncho && estiloCajaAncho,
          s.cajaEncima,
        ]}
      >
        {children}
      </View>
    );
  }

  const estiloFondoFinal = esAncho ? s.fondoAncho : [s.fondoBase, estiloFondo];

  const contenido = desplazable ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={MOSTRAR_BARRA_SCROLL}
      contentContainerStyle={s.scrollContenido}
    >
      {fondoPulsable}
      {caja}
    </ScrollView>
  ) : (
    <>
      {fondoPulsable}
      {caja}
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={statusBarTranslucent}
    >
      {evitarTeclado ? (
        <KeyboardAvoidingView behavior={comportamientoTeclado} style={estiloFondoFinal}>
          {contenido}
        </KeyboardAvoidingView>
      ) : (
        <View style={estiloFondoFinal}>{contenido}</View>
      )}
    </Modal>
  );
}

const s = StyleSheet.create({
  fondoBase: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  fondoAncho: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  scrollContenido: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  cajaAncho: {
    width: '100%',
    alignSelf: 'center',
    // Las hojas inferiores sólo redondean las esquinas superiores: en
    // escritorio se redondean las cuatro.
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
    borderWidth: 1,
  },
  cajaTablet: {
    width: '100%',
    alignSelf: 'center',
  },
  cajaAnchoLimitada: {
    maxHeight: '90%',
  },
  cajaEncima: {
    zIndex: 10,
  },
  cajaPantallaAncho: {
    width: '100%',
    alignSelf: 'center',
    height: '85%',
    maxHeight: 760,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 10,
  },
});
