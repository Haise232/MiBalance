import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Fonts, Radius, useTheme } from '@/constantes/tema';
import { useAnchoTutorial } from './medidas';

// ─── Visual 1: Balance card con importe animado ───────────────────────────────

export function BalanceVisual() {
  const C = useTheme();
  const W = useAnchoTutorial();
  const amount = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const [displayAmount, setDisplayAmount] = useState(0);

  useEffect(() => {
    const id = amount.addListener(({ value }) => setDisplayAmount(value));
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(amount, { toValue: 2450, duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start();
    return () => amount.removeListener(id);
  }, []);

  const formattedAmount = `€${Math.round(displayAmount).toLocaleString('es-ES')}`;

  return (
    <Animated.View style={{ opacity: fadeIn, width: W * 0.72 }}>
      <View style={[v.balanceCard, { backgroundColor: C.surface, borderColor: C.line }]}>
        <Text style={[v.balanceLabel, { color: C.ink4 }]}>SALDO TOTAL</Text>
        <Text style={[v.balanceAmount, { color: C.ink, fontFamily: Fonts.serif }]}>
          {formattedAmount}
        </Text>
        <View style={v.pillRow}>
          <View style={[v.pill, { backgroundColor: C.posSoft }]}>
            <Text style={[v.pillText, { color: C.pos }]}>↑ 12.4%</Text>
          </View>
          <Text style={[v.pillLabel, { color: C.ink3 }]}>flujo mensual</Text>
        </View>
        {/* Mini stats row */}
        <View style={[v.statsRow, { borderTopColor: C.line }]}>
          <View style={v.statItem}>
            <View style={[v.statDot, { backgroundColor: C.pos }]} />
            <Text style={[v.statLabel, { color: C.ink4 }]}>Ingresos</Text>
            <Text style={[v.statVal, { color: C.ink, fontFamily: Fonts.serif }]}>€3.200</Text>
          </View>
          <View style={v.statItem}>
            <View style={[v.statDot, { backgroundColor: C.neg }]} />
            <Text style={[v.statLabel, { color: C.ink4 }]}>Gastos</Text>
            <Text style={[v.statVal, { color: C.ink, fontFamily: Fonts.serif }]}>€750</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const v = StyleSheet.create({
  balanceCard: {
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    padding: 20,
  },
  balanceLabel: { fontSize: 10, letterSpacing: 1, marginBottom: 6, fontWeight: '600' },
  balanceAmount: { fontSize: 36, letterSpacing: -1, marginBottom: 10 },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  pillText: { fontSize: 12, fontWeight: '600' },
  pillLabel: { fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 20, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12 },
  statItem: { gap: 3 },
  statDot: { width: 6, height: 6, borderRadius: 3 },
  statLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4 },
  statVal: { fontSize: 14 },
});
