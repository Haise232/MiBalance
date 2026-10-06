import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TYPE_ICONS, TYPE_LABELS } from '@/componentes/cuentas/constantes';
import { ES_WEB } from '@/constantes/plataforma';
import { Fonts, Radius, useTheme } from '@/constantes/tema';
import { type Account, formatCurrency } from '@/servicios/baseDatos';

// ─── AccountCard ──────────────────────────────────────────────────────────────

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const C = useTheme();
  const [hover, setHover] = useState(false);
  const isNegative = account.balance < 0;
  const iconName = TYPE_ICONS[account.type] ?? 'account-balance';
  const typeLabel = TYPE_LABELS[account.type] ?? account.type;

  return (
    <View
      // Hover sutil en web (onPointer* se ignora en nativo).
      onPointerEnter={ES_WEB ? () => setHover(true) : undefined}
      onPointerLeave={ES_WEB ? () => setHover(false) : undefined}
      style={[
        s.accountCard,
        hover
          ? { backgroundColor: C.surface2, borderColor: C.lineStrong }
          : { backgroundColor: C.surface, borderColor: C.line },
      ]}
    >
      {/* Icon */}
      <View style={[s.accountIconWrap, { backgroundColor: C.surface2 }]}>
        <MaterialIcons name={iconName as any} size={20} color={C.ink3} />
      </View>

      {/* Name + type */}
      <View style={s.accountInfo}>
        <Text style={[s.accountName, { color: C.ink }]}>{account.name}</Text>
        <Text style={[s.accountType, { color: C.ink4 }]}>{typeLabel}</Text>
      </View>

      {/* Balance */}
      <Text
        style={[
          s.accountBalance,
          { color: isNegative ? C.neg : C.ink, fontFamily: Fonts.serif },
        ]}
      >
        {formatCurrency(account.balance)}
      </Text>

      {/* Action buttons */}
      <View style={s.actionBtns}>
        <BotonAccion
          etiqueta="Editar"
          glifo="✎"
          color={C.ink3}
          fondo={hover ? C.surface3 : C.surface2}
          fondoHover={C.surface3}
          onPress={() => onEdit(account)}
        />
        <BotonAccion
          etiqueta="Eliminar"
          glifo="✕"
          color={C.neg}
          fondo={C.negSoft}
          fondoHover={C.negSoft}
          bordeHover={C.neg}
          onPress={() => onDelete(account)}
        />
      </View>
    </View>
  );
}

// ─── Botón de acción ─────────────────────────────────────────────────────────


interface BotonAccionProps {
  etiqueta: string;
  glifo: string;
  color: string;
  fondo: string;
  fondoHover: string;
  bordeHover?: string;
  onPress: () => void;
}

function BotonAccion({ etiqueta, glifo, color, fondo, fondoHover, bordeHover, onPress }: BotonAccionProps) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      {...(ES_WEB ? ({ title: etiqueta } as object) : null)}
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      style={({ pressed }) => [
        s.actionBtn,
        { backgroundColor: hover ? fondoHover : fondo, borderColor: hover && bordeHover ? bordeHover : 'transparent' },
        ES_WEB && s.cursor,
        pressed && s.actionBtnPressed,
      ]}
    >
      <Text style={[s.actionBtnText, { color }]}>{glifo}</Text>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 10,
    gap: 10,
  },
  accountIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountInfo: { flex: 1, gap: 2 },
  accountName: { fontSize: 15, fontWeight: '500' },
  accountType: { fontSize: 12 },
  accountBalance: { fontSize: 22, fontWeight: '400' },

  // Edit / delete buttons
  actionBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: { fontSize: 14 },
  actionBtnPressed: { opacity: 0.7 },
  cursor: { cursor: 'pointer' },
});
