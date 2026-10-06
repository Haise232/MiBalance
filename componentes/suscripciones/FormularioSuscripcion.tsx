import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Dialogo from '@/componentes/Dialogo';
import SelectorFecha from '@/componentes/SelectorFecha';
import { AUTOFOCUS_WEB, ES_IOS } from '@/constantes/plataforma';
import { Radius, useTheme } from '@/constantes/tema';
import { mostrarAviso } from '@/servicios/avisos';
import { Subscription, getTodayDateString } from '@/servicios/baseDatos';
import { BillingCycle, CYCLE_LABELS, SUBSCRIPTION_ICONS, SubIcon } from './constantes';

// ─── Subscription form modal ──────────────────────────────────────────────────

interface SubscriptionFormProps {
  visible: boolean;
  initial: Subscription | null;
  onSave: (data: Omit<Subscription, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
}

export default function SubscriptionForm({ visible, initial, onSave, onCancel }: SubscriptionFormProps) {
  const C = useTheme();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [dueDate, setDueDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [icon, setIcon] = useState<SubIcon>('subscriptions');
  const amountRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setName(initial?.name ?? '');
      setAmount(initial ? String(initial.amount) : '');
      setCycle((initial?.billing_cycle as BillingCycle) ?? 'monthly');
      setDueDate(initial?.next_due_date ?? '');
      setIcon((initial?.icon as SubIcon) ?? 'subscriptions');
    }
  }, [visible, initial]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      mostrarAviso('Nombre requerido', 'Escribe un nombre para la suscripción.');
      return;
    }
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      mostrarAviso('Importe inválido', 'Introduce un importe válido mayor que 0.');
      return;
    }
    const nextDue = dueDate.trim() || null;
    await onSave({
      name: trimmedName,
      amount: parsedAmount,
      billing_cycle: cycle,
      next_due_date: nextDue,
      icon,
      is_active: initial?.is_active ?? 1,
    });
  };

  return (
    <Dialogo
      visible={visible}
      onClose={onCancel}
      desplazable
      evitarTeclado
      estiloFondo={styles.modalOverlay}
      estiloCaja={[styles.modalBox, { backgroundColor: C.surface, borderColor: C.line }]}
    >
      <Text style={[styles.modalTitle, { color: C.ink }]}>
        {initial ? 'Editar suscripción' : 'Nueva suscripción'}
      </Text>

      {/* Name */}
      <Text style={[styles.formLabel, { color: C.ink3 }]}>NOMBRE</Text>
      <TextInput
        style={[styles.textInput, { backgroundColor: C.surface2, color: C.ink, borderColor: C.line }]}
        value={name}
        onChangeText={setName}
        placeholder="Ej: Netflix"
        placeholderTextColor={C.ink4}
        maxLength={40}
        autoFocus={AUTOFOCUS_WEB}
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => amountRef.current?.focus()}
      />

      {/* Amount */}
      <Text style={[styles.formLabel, { color: C.ink3 }]}>IMPORTE (€)</Text>
      <TextInput
        style={[styles.textInput, { backgroundColor: C.surface2, color: C.ink, borderColor: C.line }]}
        value={amount}
        onChangeText={setAmount}
        placeholder="0,00"
        placeholderTextColor={C.ink4}
        keyboardType="decimal-pad"
        ref={amountRef}
        returnKeyType="done"
        onSubmitEditing={handleSave}
      />

      {/* Billing cycle chips */}
      <Text style={[styles.formLabel, { color: C.ink3 }]}>CICLO DE COBRO</Text>
      <View style={styles.chipRow}>
        {(['monthly', 'annual', 'weekly'] as BillingCycle[]).map((c) => {
          const active = cycle === c;
          return (
            <TouchableOpacity
              key={c}
              style={[
                styles.chip,
                { backgroundColor: active ? C.accent : C.surface2, borderColor: active ? C.accent : C.line },
              ]}
              onPress={() => setCycle(c)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, { color: active ? C.surface : C.ink2 }]}>
                {CYCLE_LABELS[c]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Next due date */}
      <Text style={[styles.formLabel, { color: C.ink3 }]}>PRÓXIMO COBRO (opcional)</Text>
      <TouchableOpacity
        style={[styles.textInput, { backgroundColor: C.surface2, borderColor: C.line, justifyContent: 'center' }]}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.7}
      >
        <Text style={{ color: dueDate ? C.ink : C.ink4, fontSize: 15 }}>
          {dueDate || 'Seleccionar fecha...'}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <View style={{ marginTop: 8 }}>
          <SelectorFecha
            value={dueDate || getTodayDateString()}
            onChange={setDueDate}
            onCerrar={() => setShowDatePicker(false)}
          />
          {ES_IOS && (
            <TouchableOpacity onPress={() => setShowDatePicker(false)} style={{ alignItems: 'center', padding: 10 }}>
              <Text style={{ color: C.accent, fontWeight: '600' }}>Cerrar calendario</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Icon picker */}
      <Text style={[styles.formLabel, { color: C.ink3 }]}>ÍCONO</Text>
      <View style={styles.iconGrid}>
        {SUBSCRIPTION_ICONS.map((g) => (
          <TouchableOpacity
            key={g}
            onPress={() => setIcon(g)}
            style={[
              styles.iconCell,
              { backgroundColor: icon === g ? C.ink : C.surface2 },
            ]}
          >
            <MaterialIcons
              name={g as any}
              size={20}
              color={icon === g ? C.surface : C.ink3}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.modalBtns}>
        <TouchableOpacity
          style={[styles.modalBtn, { backgroundColor: C.surface2 }]}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text style={[styles.modalBtnText, { color: C.ink2 }]}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalBtn, { backgroundColor: C.accent }]}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text style={[styles.modalBtnText, { color: C.surface }]}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </Dialogo>
  );
}

const styles = StyleSheet.create({
  // Modal
  modalOverlay: {
    padding: 20,
  },
  modalBox: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 24,
    marginVertical: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 6,
    marginTop: 14,
  },
  textInput: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconCell: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
