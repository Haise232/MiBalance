import React, { useRef, useState } from 'react';
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
import SelectorFecha from '@/componentes/SelectorFecha';
import { AUTOFOCUS_WEB, COMPORTAMIENTO_TECLADO } from '@/constantes/plataforma';
import { Fonts, useTheme, useWebTexture } from '@/constantes/tema';
import { addDebt, getTodayDateString } from '@/servicios/baseDatos';
import { modalStyles as m } from './estilosModal';

// ─── Add Debt Modal ───────────────────────────────────────────────────────────

type AddDebtModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
};

export default function AddDebtModal({ visible, onClose, onSave }: AddDebtModalProps) {
  const C = useTheme();
  const texture = useWebTexture();
  const [direction, setDirection] = useState<'owe' | 'owed_to_me'>('owe');
  const [who, setWho] = useState('');
  const [what, setWhat] = useState('');
  const [total, setTotal] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const whatRef = useRef<TextInput>(null);
  const totalRef = useRef<TextInput>(null);

  const reset = () => {
    setDirection('owe');
    setWho('');
    setWhat('');
    setTotal('');
    setDueDate('');
    setShowDatePicker(false);
    setError('');
  };

  const handleSave = async () => {
    if (saving) return;
    const amount = parseFloat(total.replace(',', '.'));
    if (!who.trim()) { setError('Indica a quién'); return; }
    if (!what.trim()) { setError('Indica el concepto'); return; }
    if (isNaN(amount) || amount <= 0) { setError('Importe no válido'); return; }
    setError('');
    setSaving(true);
    try {
      await addDebt({
        direction,
        who: who.trim(),
        what: what.trim(),
        total: amount,
        paid: 0,
        due_date: dueDate.trim() || null,
      });
      reset();
      onSave();
    } catch {
      setError('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialogo visible={visible} onClose={onClose} presentacion="pantalla">
      <SafeAreaView style={[m.modalSafe, { backgroundColor: C.bg }, texture]}>
        <KeyboardAvoidingView behavior={COMPORTAMIENTO_TECLADO} style={m.modalColumn}>
          <View style={[m.modalHeader, { borderBottomColor: C.line }]}>
            <TouchableOpacity onPress={() => { reset(); onClose(); }}>
              <Text style={[m.modalCancel, { color: C.ink3 }]}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={[m.modalTitle, { color: C.ink }]}>Nueva deuda</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Text style={[m.modalSave, { color: C.accent }]}>
                {saving ? '…' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={m.modalBody}>
            <View style={[styles.seg, { backgroundColor: C.surface2 }]}>
              {(['owe', 'owed_to_me'] as const).map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.segItem, direction === d && { backgroundColor: C.surface, shadowColor: C.ink }]}
                  onPress={() => setDirection(d)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.segLabel, { color: direction === d ? C.ink : C.ink3 }]}>
                    {d === 'owe' ? 'Debo' : 'Me deben'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={m.fieldGroup}>
              <Text style={[m.fieldLabel, { color: C.ink3 }]}>
                {direction === 'owe' ? 'A QUIÉN DEBO' : 'QUIÉN ME DEBE'}
              </Text>
              <View style={[m.fieldCtl, { backgroundColor: C.surface, borderColor: C.line }]}>
                <TextInput
                  style={[m.fieldInput, { color: C.ink }]}
                  placeholder={direction === 'owe' ? 'Banco BBVA, Carlos…' : 'Ana R., Luis P…'}
                  placeholderTextColor={C.ink4}
                  value={who}
                  onChangeText={setWho}
                  autoFocus={AUTOFOCUS_WEB}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => whatRef.current?.focus()}
                />
              </View>
            </View>

            <View style={m.fieldGroup}>
              <Text style={[m.fieldLabel, { color: C.ink3 }]}>CONCEPTO</Text>
              <View style={[m.fieldCtl, { backgroundColor: C.surface, borderColor: C.line }]}>
                <TextInput
                  style={[m.fieldInput, { color: C.ink }]}
                  placeholder="Préstamo personal, cena…"
                  placeholderTextColor={C.ink4}
                  value={what}
                  onChangeText={setWhat}
                  ref={whatRef}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => totalRef.current?.focus()}
                />
              </View>
            </View>

            <View style={m.fieldGroup}>
              <Text style={[m.fieldLabel, { color: C.ink3 }]}>IMPORTE</Text>
              <View style={[m.fieldCtl, { backgroundColor: C.surface, borderColor: C.line }]}>
                <Text style={[m.fieldPrefix, { color: C.ink3 }]}>€</Text>
                <TextInput
                  style={[m.fieldInput, m.fieldAmount, { color: C.ink, fontFamily: Fonts.serif }]}
                  placeholder="0,00"
                  placeholderTextColor={C.ink4}
                  value={total}
                  onChangeText={setTotal}
                  keyboardType="decimal-pad"
                  ref={totalRef}
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />
              </View>
            </View>

            <View style={m.fieldGroup}>
              <Text style={[m.fieldLabel, { color: C.ink3 }]}>FECHA LÍMITE (opcional)</Text>
              <TouchableOpacity
                style={[m.fieldCtl, { backgroundColor: C.surface, borderColor: C.line }]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={[m.fieldInput, { color: dueDate ? C.ink : C.ink4 }]}>
                  {dueDate || `${getTodayDateString()} (AAAA-MM-DD)`}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <View style={{ marginTop: 8 }}>
                  <SelectorFecha
                    value={dueDate || getTodayDateString()}
                    onChange={setDueDate}
                    onCerrar={() => setShowDatePicker(false)}
                  />
                </View>
              )}
            </View>

            {error ? <Text style={[m.errorText, { color: C.neg }]}>{error}</Text> : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Dialogo>
  );
}

const styles = StyleSheet.create({
  seg: {
    flexDirection: 'row',
    borderRadius: 100,
    padding: 4,
    marginBottom: 20,
  },
  segItem: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 100,
    alignItems: 'center',
  },
  segLabel: { fontSize: 13 },
});
