import { MaterialIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FilaHover } from '@/componentes/lista/AccionesHover';
import { ES_WEB } from '@/constantes/plataforma';
import { Fonts, Radius, useTheme } from '@/constantes/tema';
import { Transaction, formatCurrency, formatDate } from '@/servicios/baseDatos';

// Map category name → MaterialIcons name (mirrors DB defaults)
const ICON_MAP: Record<string, string> = {
  Alquiler: 'home', Comida: 'restaurant', Transporte: 'directions-car',
  Ocio: 'sports-esports', Salud: 'local-hospital', Servicios: 'build',
  Mercado: 'shopping-cart', Ropa: 'checkroom', Suscripciones: 'subscriptions',
  Farmacia: 'local-pharmacy', Restaurantes: 'dinner-dining', Viajes: 'flight',
  Educación: 'school', Mascotas: 'pets', Otros: 'more-horiz',
  Salario: 'work', Freelance: 'laptop', Inversión: 'trending-up',
  Regalo: 'card-giftcard', Venta: 'sell', Reembolso: 'undo',
  Otro: 'category',
};

interface TransactionItemProps {
  transaction: Transaction;
  onDelete?: (transaction: Transaction) => void;
  onEdit?: (transaction: Transaction) => void;
  /** @deprecated use onDelete */
  onLongPress?: (transaction: Transaction) => void;
}

export default function ItemMovimiento({
  transaction,
  onDelete,
  onEdit,
  onLongPress,
}: TransactionItemProps) {
  const C = useTheme();
  const swipeRef = useRef<Swipeable>(null);

  const isIncome = transaction.type === 'income';
  const isDebt = transaction.type === 'debt';
  const iconName = (ICON_MAP[transaction.category] ?? 'category') as any;

  const amountColor = isIncome ? C.pos : isDebt ? C.warn : C.ink2;
  const iconBg = isIncome ? C.posSoft : isDebt ? C.warnSoft : C.surface2;
  const iconColor = isIncome ? C.pos : isDebt ? C.warn : C.ink3;

  // ── Swipe RIGHT → delete ────────────────────────────────────────────────────
  const renderLeftActions = (_: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({ inputRange: [0, 80], outputRange: [0.6, 1], extrapolate: 'clamp' });
    return (
      <TouchableOpacity
        style={[styles.swipeAction, styles.deleteAction, { backgroundColor: C.neg }]}
        onPress={() => {
          swipeRef.current?.close();
          onDelete?.(transaction);
          onLongPress?.(transaction);
        }}
        activeOpacity={0.85}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <MaterialIcons name="delete" size={22} color="#fff" />
        </Animated.View>
        <Text style={styles.swipeLabel}>Eliminar</Text>
      </TouchableOpacity>
    );
  };

  // ── Swipe LEFT → edit ───────────────────────────────────────────────────────
  const renderRightActions = (_: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({ inputRange: [-80, 0], outputRange: [1, 0.6], extrapolate: 'clamp' });
    return (
      <TouchableOpacity
        style={[styles.swipeAction, styles.editAction, { backgroundColor: C.accent }]}
        onPress={() => {
          swipeRef.current?.close();
          onEdit?.(transaction);
        }}
        activeOpacity={0.85}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <MaterialIcons name="edit" size={22} color="#fff" />
        </Animated.View>
        <Text style={styles.swipeLabel}>Editar</Text>
      </TouchableOpacity>
    );
  };

  const renderFila = (activa: boolean, ranura: React.ReactNode = null) => (
    <View
      style={[
        styles.container,
        activa
          ? { backgroundColor: C.surface2, borderColor: C.lineStrong }
          : { backgroundColor: C.surface, borderColor: C.line },
      ]}
    >
      {/* Icon circle */}
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <MaterialIcons name={iconName} size={18} color={iconColor} />
      </View>

      {/* Details */}
      <View style={styles.details}>
        <Text style={[styles.category, { color: C.ink }]} numberOfLines={1}>
          {transaction.description || transaction.category}
        </Text>
        <Text style={[styles.description, { color: C.ink4 }]} numberOfLines={1}>
          {transaction.description ? `${transaction.category} · ${formatDate(transaction.date)}` : formatDate(transaction.date)}
        </Text>
      </View>

      {/* Amount */}
      <View style={styles.amountCol}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {isIncome ? '+' : isDebt ? '~' : '-'}{formatCurrency(transaction.amount)}
        </Text>
      </View>

      {/* Acciones (web): ranura fija tras el importe, visible con hover/foco */}
      {ranura && <View style={styles.ranura}>{ranura}</View>}
    </View>
  );

  const eliminar = onDelete || onLongPress
    ? () => {
        onDelete?.(transaction);
        onLongPress?.(transaction);
      }
    : undefined;

  // ── Web: acciones visibles al pasar el ratón (sin gesto de swipe) ─────────
  if (ES_WEB) {
    return (
      <FilaHover
        style={styles.webContainer}
        acciones={[
          onEdit && { icono: 'edit', etiqueta: 'Editar', onPress: () => onEdit(transaction) },
          eliminar && { icono: 'delete-outline', etiqueta: 'Eliminar', onPress: eliminar, tono: 'neg' },
        ]}
      >
        {renderFila}
      </FilaHover>
    );
  }

  return (
    <Swipeable
      ref={swipeRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={onEdit ? renderRightActions : undefined}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
      leftThreshold={60}
      rightThreshold={60}
      containerStyle={styles.swipeContainer}
    >
      {renderFila(false)}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    marginBottom: 8,
    marginHorizontal: 16,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  ranura: { marginLeft: 10 },
  webContainer: {
    marginBottom: 8,
    marginHorizontal: 16,
    borderRadius: Radius.md,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  details: { flex: 1 },
  category: { fontSize: 15, fontWeight: '500', marginBottom: 2 },
  description: { fontSize: 12 },
  amountCol: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: '600', fontFamily: Fonts.serif },
  date: { fontSize: 11, marginTop: 2 },
  // Swipe actions
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    gap: 4,
  },
  deleteAction: { borderRadius: Radius.md },
  editAction: { borderRadius: Radius.md },
  swipeLabel: { color: '#fff', fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
});
