import { MaterialIcons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { AccionFila, FilaHover } from '@/componentes/lista/AccionesHover';
import { ES_WEB } from '@/constantes/plataforma';
import { Fonts, Radius, useTheme } from '@/constantes/tema';
import { Debt, formatCurrency } from '@/servicios/baseDatos';

// ─── Debt card ────────────────────────────────────────────────────────────────

type OweCardProps = {
  debt: Debt;
  onPay: (debt: Debt) => void;
  /** Fila en hover/foco (solo web). */
  activa?: boolean;
  /** Ranura inline de acciones (solo web). */
  ranura?: React.ReactNode;
};

function OweCard({ debt, onPay, activa = false, ranura = null }: OweCardProps) {
  const C = useTheme();
  const remaining = debt.total - debt.paid;
  const pct = debt.total > 0 ? Math.min(100, (debt.paid / debt.total) * 100) : 0;

  return (
    <View
      style={[
        styles.mbCard,
        activa
          ? { backgroundColor: C.surface2, borderColor: C.lineStrong }
          : { backgroundColor: C.surface, borderColor: C.line },
      ]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.cardIcon, { backgroundColor: C.warnSoft }]}>
          <Text style={[styles.cardIconGlyph, { color: C.warn, fontFamily: Fonts.serif }]}>◧</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardWho, { color: C.ink }]}>{debt.who}</Text>
          <Text style={[styles.cardWhat, { color: C.ink3 }]}>
            {debt.what}{debt.due_date ? ` · vence ${debt.due_date}` : ''}
          </Text>
        </View>
        <View style={styles.cardAmounts}>
          <Text style={[styles.cardAmountLarge, { color: C.ink, fontFamily: Fonts.serif }]}>
            {formatCurrency(remaining)}
          </Text>
          <Text style={[styles.cardAmountSmall, { color: C.ink3 }]}>
            de {formatCurrency(debt.total)}
          </Text>
        </View>
        {ranura}
      </View>

      <View style={[styles.mbBar, { backgroundColor: C.surface2 }]}>
        <View style={[styles.mbBarFill, { width: `${pct}%` as any, backgroundColor: C.warn }]} />
      </View>

      <View style={styles.cardBottom}>
        <Text style={[styles.cardStatusText, { color: C.ink3 }]}>{Math.round(pct)}% pagado</Text>
        {remaining > 0 && (
          <TouchableOpacity onPress={() => onPay(debt)}>
            <Text style={[styles.cardActionText, { color: C.accent }]}>Registrar abono →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function OwedToMeCard({
  debt,
  activa = false,
  ranura = null,
}: {
  debt: Debt;
  activa?: boolean;
  ranura?: React.ReactNode;
}) {
  const C = useTheme();
  return (
    <View
      style={[
        styles.mbCardSimple,
        activa
          ? { backgroundColor: C.surface2, borderColor: C.lineStrong }
          : { backgroundColor: C.surface, borderColor: C.line },
      ]}
    >
      <View style={[styles.cardIconSmall, { backgroundColor: C.posSoft }]}>
        <Text style={[styles.cardIconGlyphSmall, { color: C.pos, fontFamily: Fonts.serif }]}>↗</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardWho, { color: C.ink }]}>{debt.who}</Text>
        <Text style={[styles.cardWhat, { color: C.ink3 }]}>{debt.what}</Text>
      </View>
      <Text style={[styles.cardAmountMed, { color: C.pos, fontFamily: Fonts.serif }]}>
        {formatCurrency(debt.total - debt.paid)}
      </Text>
      {ranura}
    </View>
  );
}

// ─── Swipeable wrappers ───────────────────────────────────────────────────────

type SwipeToDeleteProps = {
  onDelete: () => void;
  /** Acciones adicionales mostradas en hover en web (p. ej. registrar abono). */
  accionesExtra?: AccionFila[];
  /** Recibe si la fila está activa y la ranura de acciones (web; en nativo false/null). */
  children: (activa: boolean, ranura: React.ReactNode) => React.ReactNode;
};

function SwipeToDelete({ onDelete, accionesExtra = [], children }: SwipeToDeleteProps) {
  const C = useTheme();
  const swipeRef = useRef<Swipeable>(null);

  // En web: sin swipe (interfiere con la selección de texto del ratón);
  // las acciones se muestran como botones al pasar el ratón.
  if (ES_WEB) {
    return (
      <FilaHover
        style={styles.webContainer}
        acciones={[
          ...accionesExtra,
          { icono: 'delete-outline', etiqueta: 'Eliminar', onPress: onDelete, tono: 'neg' },
        ]}
      >
        {children}
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

  return (
    <Swipeable
      ref={swipeRef}
      renderLeftActions={renderLeftActions}
      overshootLeft={false}
      friction={2}
      leftThreshold={60}
      containerStyle={styles.swipeContainer}
    >
      {children(false, null)}
    </Swipeable>
  );
}

type SwipeableOweCardProps = {
  debt: Debt;
  onPay: (debt: Debt) => void;
  onDelete: (id: number) => void;
};

export function SwipeableOweCard({ debt, onPay, onDelete }: SwipeableOweCardProps) {
  const pendiente = debt.total - debt.paid > 0;
  return (
    <SwipeToDelete
      onDelete={() => onDelete(debt.id)}
      accionesExtra={
        pendiente
          ? [{ icono: 'payments', etiqueta: 'Registrar abono', onPress: () => onPay(debt), tono: 'accent' }]
          : []
      }
    >
      {(activa, ranura) => <OweCard debt={debt} onPay={onPay} activa={activa} ranura={ranura} />}
    </SwipeToDelete>
  );
}

type SwipeableOwedToMeCardProps = {
  debt: Debt;
  onDelete: (id: number) => void;
};

export function SwipeableOwedToMeCard({ debt, onDelete }: SwipeableOwedToMeCardProps) {
  return (
    <SwipeToDelete onDelete={() => onDelete(debt.id)}>
      {(activa, ranura) => <OwedToMeCard debt={debt} activa={activa} ranura={ranura} />}
    </SwipeToDelete>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  webContainer: { borderRadius: Radius.md },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    gap: 4,
  },
  deleteAction: { borderRadius: Radius.md },
  swipeLabel: { color: '#fff', fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
  mbCard: {
    padding: 18,
    borderWidth: 0.5,
    borderRadius: Radius.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconGlyph: { fontSize: 18 },
  cardInfo: { flex: 1 },
  cardWho: { fontSize: 14, fontWeight: '500' },
  cardWhat: { fontSize: 12, marginTop: 2 },
  cardAmounts: { alignItems: 'flex-end' },
  cardAmountLarge: { fontSize: 18 },
  cardAmountSmall: { fontSize: 11, marginTop: 2 },
  mbBar: { height: 6, borderRadius: 100, overflow: 'hidden' },
  mbBarFill: { height: '100%', borderRadius: 100 },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cardStatusText: { fontSize: 11 },
  cardActionText: { fontSize: 11 },

  mbCardSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 0.5,
    borderRadius: Radius.md,
    gap: 12,
  },
  cardIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconGlyphSmall: { fontSize: 18 },
  cardAmountMed: { fontSize: 18 },
});
