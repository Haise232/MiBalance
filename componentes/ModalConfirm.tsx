import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Dialogo from '@/componentes/Dialogo';
import { Fonts, Radius, useTheme } from '@/constantes/tema';

interface ModalConfirmProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ModalConfirm({
  visible,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: ModalConfirmProps) {
  const C = useTheme();

  return (
    <Dialogo
      visible={visible}
      onClose={onCancel}
      estiloFondo={s.overlay}
      estiloCaja={[s.sheet, { backgroundColor: C.surface, borderColor: C.line }]}
      estiloCajaAncho={s.sheetWide}
      anchoMax={440}
    >
      {/* Icono */}
      <View style={[s.iconWrap, { backgroundColor: C.negSoft }]}>
        <Text style={[s.iconGlyph, { color: C.neg }]}>✕</Text>
      </View>

      {/* Texto */}
      <Text style={[s.title, { color: C.ink, fontFamily: Fonts.serif }]}>{title}</Text>
      <Text style={[s.body, { color: C.ink3 }]}>{message}</Text>

      {/* Acciones */}
      <View style={s.btnRow}>
        <TouchableOpacity
          style={[s.btn, s.btnCancel, { backgroundColor: C.surface2 }]}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
          activeOpacity={0.75}
        >
          <Text style={[s.btnLabel, { color: C.ink2 }]}>{cancelLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.btn, s.btnConfirm, { backgroundColor: C.neg }]}
          onPress={onConfirm}
          accessibilityRole="button"
          accessibilityLabel={confirmLabel}
          activeOpacity={0.85}
        >
          <Text style={[s.btnLabel, { color: '#fff' }]}>{confirmLabel}</Text>
        </TouchableOpacity>
      </View>
    </Dialogo>
  );
}

const s = StyleSheet.create({
  overlay: {
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 0.5,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 44,
    alignItems: 'center',
    gap: 6,
  },
  sheetWide: { paddingBottom: 28 },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconGlyph: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  title: {
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 10,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 6,
  },
  btn: {
    flex: 1,
    height: 50,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancel: {},
  btnConfirm: {},
  btnLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
});
