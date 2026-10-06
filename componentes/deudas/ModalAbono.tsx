import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Dialogo from '@/componentes/Dialogo';
import { COMPORTAMIENTO_TECLADO } from '@/constantes/plataforma';
import { Fonts, Radius, useTheme, useWebTexture } from '@/constantes/tema';
import { Debt, formatCurrency } from '@/servicios/baseDatos';
import { modalStyles as m } from './estilosModal';

// ─── Abono Modal ─────────────────────────────────────────────────────────────

type AbonoModalProps = {
  visible: boolean;
  debt: Debt | null;
  onClose: () => void;
  onConfirm: (amount: number) => void;
};

export default function AbonoModal({ visible, debt, onClose, onConfirm }: AbonoModalProps) {
  const C = useTheme();
  const texture = useWebTexture();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setAmount('');
      setError('');
      setSaving(false);
    }
  }, [visible]);

  const remaining = debt ? debt.total - debt.paid : 0;

  const handleConfirm = () => {
    if (saving) return;
    const parsed = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      setError('Introduce un importe válido mayor que 0');
      return;
    }
    if (parsed > remaining) {
      setError(`El abono no puede superar el pendiente (${formatCurrency(remaining)})`);
      return;
    }
    setError('');
    setSaving(true);
    onConfirm(parsed);
  };

  return (
    <Dialogo visible={visible} onClose={onClose} presentacion="pantalla">
      <SafeAreaView style={[m.modalSafe, { backgroundColor: C.bg }, texture]}>
        <KeyboardAvoidingView behavior={COMPORTAMIENTO_TECLADO} style={m.modalColumn}>
          <View style={[m.modalHeader, { borderBottomColor: C.line }]}>
            <TouchableOpacity onPress={onClose}>
              <Text style={[m.modalCancel, { color: C.ink3 }]}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={[m.modalTitle, { color: C.ink }]}>Registrar abono</Text>
            <TouchableOpacity onPress={handleConfirm} disabled={saving}>
              <Text style={[m.modalSave, { color: C.accent }]}>
                {saving ? '…' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={m.modalBody}>
            {debt && (
              <View style={[styles.abonoInfo, { backgroundColor: C.surface, borderColor: C.line }]}>
                <Text style={[styles.abonoWho, { color: C.ink }]}>{debt.who}</Text>
                <Text style={[styles.abonoWhat, { color: C.ink3 }]}>{debt.what}</Text>
                <Text style={[styles.abonoPending, { color: C.warn, fontFamily: Fonts.serif }]}>
                  Pendiente: {formatCurrency(remaining)}
                </Text>
              </View>
            )}

            <View style={m.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={[m.fieldLabel, { color: C.ink3, marginBottom: 0 }]}>IMPORTE DEL ABONO</Text>
                <TouchableOpacity onPress={() => { setAmount(remaining.toString().replace('.', ',')); setError(''); }}>
                  <Text style={[styles.liquidarText, { color: C.accent }]}>Liquidar todo</Text>
                </TouchableOpacity>
              </View>
              <View style={[m.fieldCtl, { backgroundColor: C.surface, borderColor: C.line }]}>
                <Text style={[m.fieldPrefix, { color: C.ink3 }]}>€</Text>
                <TextInput
                  style={[m.fieldInput, m.fieldAmount, { color: C.ink, fontFamily: Fonts.serif }]}
                  placeholder="0,00"
                  placeholderTextColor={C.ink4}
                  value={amount}
                  onChangeText={(t) => { setAmount(t); setError(''); }}
                  keyboardType="decimal-pad"
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleConfirm}
                />
              </View>
            </View>

            {error ? <Text style={[m.errorText, { color: C.neg }]}>{error}</Text> : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Dialogo>
  );
}

const styles = StyleSheet.create({
  abonoInfo: {
    borderWidth: 0.5,
    borderRadius: Radius.sm,
    padding: 14,
    marginBottom: 20,
    gap: 4,
  },
  abonoWho: { fontSize: 15, fontWeight: '600' },
  abonoWhat: { fontSize: 13 },
  abonoPending: { fontSize: 13, marginTop: 4, fontWeight: '500' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 },
  liquidarText: { fontSize: 12, fontWeight: '500' },
});
