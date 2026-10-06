import { MaterialIcons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { FilaHover } from '@/componentes/lista/AccionesHover';
import { ES_WEB } from '@/constantes/plataforma';
import { Fonts, Radius, useTheme } from '@/constantes/tema';
import { Subscription, formatCurrency } from '@/servicios/baseDatos';
import { BillingCycle, CYCLE_LABELS } from './constantes';

// ─── Subscription row ─────────────────────────────────────────────────────────

interface SubscriptionRowProps {
  sub: Subscription;
  onToggle: () => void;
  /** Fila en hover/foco (solo web). */
  activa?: boolean;
  /** Ranura inline de acciones (solo web), tras el botón pausar/reactivar. */
  ranura?: React.ReactNode;
}

function SubscriptionRow({ sub, onToggle, activa = false, ranura = null }: SubscriptionRowProps) {
  const C = useTheme();
  const isActive = sub.is_active === 1;

  return (
    <View
      style={[
        styles.subRow,
        activa
          ? { backgroundColor: C.surface2, borderColor: C.lineStrong }
          : { backgroundColor: C.surface, borderColor: C.line },
      ]}
    >
      {/* Icon */}
      <View style={[styles.subIconWrap, { backgroundColor: isActive ? C.accentSoft : C.surface2 }]}>
        <MaterialIcons
          name={sub.icon as any}
          size={20}
          color={isActive ? C.accent : C.ink4}
        />
      </View>

      {/* Text block */}
      <View style={styles.subInfo}>
        <View style={styles.subNameRow}>
          <Text
            style={[
              styles.subName,
              { color: isActive ? C.ink : C.ink4 },
            ]}
            numberOfLines={1}
          >
            {sub.name}
          </Text>
          {!isActive && (
            <View style={[styles.cancelledBadge, { backgroundColor: C.surface3 }]}>
              <Text style={[styles.cancelledText, { color: C.ink4 }]}>Cancelada</Text>
            </View>
          )}
        </View>
        <Text style={[styles.subCycle, { color: C.ink3 }]}>
          {CYCLE_LABELS[sub.billing_cycle as BillingCycle]}
          {sub.next_due_date ? `  ·  próximo ${sub.next_due_date}` : ''}
        </Text>
      </View>

      {/* Amount */}
      <Text style={[styles.subAmount, { color: isActive ? C.ink : C.ink4, fontFamily: Fonts.serif }]}>
        {formatCurrency(sub.amount)}
      </Text>

      {/* Toggle button */}
      <TouchableOpacity
        onPress={onToggle}
        hitSlop={10}
        style={[styles.toggleBtn, ES_WEB && styles.cursor]}
        accessibilityRole="button"
        accessibilityLabel={isActive ? 'Pausar' : 'Reactivar'}
      >
        <MaterialIcons
          name={isActive ? 'pause-circle' : 'play-circle'}
          size={26}
          color={isActive ? C.ink3 : C.pos}
        />
      </TouchableOpacity>

      {ranura}
    </View>
  );
}

// ─── Swipeable subscription row ───────────────────────────────────────────────

interface SwipeableSubscriptionRowProps {
  sub: Subscription;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

export default function SwipeableSubscriptionRow({ sub, onEdit, onToggle, onDelete }: SwipeableSubscriptionRowProps) {
  const C = useTheme();
  const swipeRef = useRef<Swipeable>(null);

  // ── Web: sin swipe; editar/eliminar aparecen al pasar el ratón ─────────────
  if (ES_WEB) {
    return (
      <FilaHover
        style={styles.webContainer}
        acciones={[
          { icono: 'edit', etiqueta: 'Editar', onPress: onEdit },
          { icono: 'delete-outline', etiqueta: 'Eliminar', onPress: onDelete, tono: 'neg' },
        ]}
      >
        {(activa, ranura) => (
          <SubscriptionRow sub={sub} onToggle={onToggle} activa={activa} ranura={ranura} />
        )}
      </FilaHover>
    );
  }

  const renderLeftActions = (_: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({ inputRange: [0, 80], outputRange: [0.6, 1], extrapolate: 'clamp' });
    return (
      <TouchableOpacity
        style={[styles.swipeAction, styles.deleteAction, { backgroundColor: C.neg }]}
        onPress={() => {
          swipeRef.current?.close();
          onDelete();
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

  const renderRightActions = (_: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({ inputRange: [-80, 0], outputRange: [1, 0.6], extrapolate: 'clamp' });
    return (
      <TouchableOpacity
        style={[styles.swipeAction, styles.editAction, { backgroundColor: C.accent }]}
        onPress={() => {
          swipeRef.current?.close();
          onEdit();
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

  return (
    <Swipeable
      ref={swipeRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
      leftThreshold={60}
      rightThreshold={60}
      containerStyle={styles.swipeContainer}
    >
      <SubscriptionRow sub={sub} onToggle={onToggle} />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  // Subscription row
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  swipeContainer: {
    marginBottom: 8,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  webContainer: { marginBottom: 8, borderRadius: Radius.md },
  cursor: { cursor: 'pointer' },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    gap: 4,
  },
  deleteAction: { borderRadius: Radius.md },
  editAction: { borderRadius: Radius.md },
  swipeLabel: { color: '#fff', fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
  subIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subInfo: {
    flex: 1,
    gap: 3,
  },
  subNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subName: {
    fontSize: 15,
    fontWeight: '500',
    flexShrink: 1,
  },
  cancelledBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  cancelledText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  subCycle: {
    fontSize: 12,
  },
  subAmount: {
    fontSize: 15,
  },
  toggleBtn: {
    padding: 2,
  },
});
