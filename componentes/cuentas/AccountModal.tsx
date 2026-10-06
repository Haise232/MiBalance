import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Dialogo from '@/componentes/Dialogo';
import { ACCOUNT_TYPES, TYPE_ICONS, TYPE_LABELS } from '@/componentes/cuentas/constantes';
import { AUTOFOCUS_WEB } from '@/constantes/plataforma';
import { Radius, useTheme } from '@/constantes/tema';
import { mostrarAviso } from '@/servicios/avisos';
import type { Account } from '@/servicios/baseDatos';

// ─── AccountModal ─────────────────────────────────────────────────────────────

export type ModalMode = 'add' | 'edit';

interface AccountModalProps {
  visible: boolean;
  mode: ModalMode;
  initial?: Account;
  onClose: () => void;
  onSave: (name: string, type: Account['type'], balance: number) => Promise<void>;
}

export function AccountModal({ visible, mode, initial, onClose, onSave }: AccountModalProps) {
  const C = useTheme();

  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('cash');
  const [balanceText, setBalanceText] = useState('');
  const [saving, setSaving] = useState(false);
  const balanceRef = useRef<TextInput>(null);

  // Sync fields when the modal opens or switches target account
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initial) {
        setName(initial.name);
        setType(initial.type);
        setBalanceText(String(initial.balance));
      } else {
        setName('');
        setType('cash');
        setBalanceText('');
      }
    }
  }, [visible, mode, initial]);

  const handleSave = async () => {
    if (saving) return;
    const trimmed = name.trim();
    if (!trimmed) {
      mostrarAviso('Campo requerido', 'Introduce un nombre para la cuenta.');
      return;
    }

    const parsed = parseFloat(balanceText.replace(',', '.'));
    if (isNaN(parsed)) {
      mostrarAviso('Saldo inválido', 'Introduce un número válido para el saldo.');
      return;
    }

    try {
      setSaving(true);
      await onSave(trimmed, type, parsed);
      onClose();
    } catch (err) {
      mostrarAviso('Error', 'No se pudo guardar la cuenta. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = [
    s.input,
    {
      backgroundColor: C.surface2,
      borderColor: C.line,
      color: C.ink,
    },
  ];

  return (
    <Dialogo
      visible={visible}
      onClose={onClose}
      statusBarTranslucent
      cerrarAlTocarFondo
      evitarTeclado
      estiloFondo={s.overlay}
      estiloCaja={[s.modalBox, { backgroundColor: C.surface, borderColor: C.line }]}
    >
      {/* Modal header */}
      <Text style={[s.modalTitle, { color: C.ink }]}>
        {mode === 'add' ? 'Nueva cuenta' : 'Editar cuenta'}
      </Text>

      {/* Name input */}
      <Text style={[s.inputLabel, { color: C.ink3 }]}>Nombre</Text>
      <TextInput
        style={inputStyle}
        value={name}
        onChangeText={setName}
        placeholder="p. ej. Cuenta corriente"
        placeholderTextColor={C.ink4}
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => balanceRef.current?.focus()}
        autoFocus={AUTOFOCUS_WEB}
        maxLength={40}
      />

      {/* Type selector — shown when adding; read-only badge when editing */}
      <Text style={[s.inputLabel, { color: C.ink3 }]}>Tipo</Text>
      {mode === 'add' ? (
        <View style={s.typeRow}>
          {ACCOUNT_TYPES.map((t) => {
            const selected = type === t;
            return (
              <TouchableOpacity
                key={t}
                style={[
                  s.typeChip,
                  {
                    backgroundColor: selected ? C.accent : C.surface2,
                    borderColor: selected ? C.accent : C.line,
                  },
                ]}
                onPress={() => setType(t)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialIcons name={TYPE_ICONS[t] as any} size={16} color={selected ? '#fff' : C.ink3} />
                  <Text style={[s.typeChipText, { color: selected ? '#fff' : C.ink3 }]}>
                    {TYPE_LABELS[t]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={[s.typeChip, { backgroundColor: C.surface2, borderColor: C.line, alignSelf: 'flex-start' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialIcons name={TYPE_ICONS[type] as any} size={16} color={C.ink3} />
            <Text style={[s.typeChipText, { color: C.ink3 }]}>{TYPE_LABELS[type]}</Text>
          </View>
        </View>
      )}

      {/* Balance input */}
      <Text style={[s.inputLabel, { color: C.ink3 }]}>
        {mode === 'add' ? 'Saldo inicial' : 'Saldo actual'}
      </Text>
      <TextInput
        style={inputStyle}
        value={balanceText}
        onChangeText={setBalanceText}
        placeholder="0.00"
        placeholderTextColor={C.ink4}
        keyboardType="decimal-pad"
        returnKeyType="done"
        ref={balanceRef}
        onSubmitEditing={handleSave}
      />

      {/* Action buttons */}
      <View style={s.modalBtns}>
        <TouchableOpacity
          style={[s.modalBtn, { backgroundColor: C.surface2 }]}
          onPress={onClose}
          activeOpacity={0.7}
          disabled={saving}
        >
          <Text style={[s.modalBtnLabel, { color: C.ink2 }]}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.modalBtn, { backgroundColor: C.accent }]}
          onPress={handleSave}
          activeOpacity={0.7}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={[s.modalBtnLabel, { color: '#fff' }]}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>
    </Dialogo>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  overlay: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    width: '100%',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 14,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    height: 46,
    paddingHorizontal: 14,
    fontSize: 15,
  },

  // Type selector chips
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeChip: {
    flex: 1,
    minWidth: 80,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Modal action row
  modalBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
