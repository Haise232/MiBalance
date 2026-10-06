import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Radius, useTheme } from '@/constantes/tema';
import { useAnchoTutorial } from './medidas';

// ─── Visual 4: Barras del gráfico creciendo ───────────────────────────────────

export function ChartVisual() {
  const C = useTheme();
  const W = useAnchoTutorial();
  const MAX_H = 90;
  const bars = [
    { income: 0.4, expense: 0.6 },
    { income: 0.7, expense: 0.5 },
    { income: 0.5, expense: 0.3 },
    { income: 0.9, expense: 0.7 },
    { income: 0.6, expense: 0.4 },
    { income: 0.8, expense: 0.5 },
  ];
  const anims = useRef(bars.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const sequence = anims.map((a, i) =>
      Animated.timing(a, {
        toValue: 1,
        duration: 350,
        delay: i * 80,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: false,
      })
    );
    Animated.stagger(80, sequence).start();
  }, []);

  const months = ['E', 'F', 'M', 'A', 'M', 'J'];

  return (
    <View style={[v.chartCard, { backgroundColor: C.surface, borderColor: C.line, width: W * 0.72 }]}>
      <Text style={[v.chartTitle, { color: C.ink4 }]}>FLUJO · 6 MESES</Text>
      <View style={v.chartArea}>
        {bars.map((bar, i) => (
          <View key={i} style={v.barGroup}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: MAX_H }}>
              <View style={{ width: 8, height: MAX_H, justifyContent: 'flex-end' }}>
                <Animated.View style={{ height: anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, bar.income * MAX_H] }), backgroundColor: C.pos, borderRadius: 2 }} />
              </View>
              <View style={{ width: 8, height: MAX_H, justifyContent: 'flex-end' }}>
                <Animated.View style={{ height: anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, bar.expense * MAX_H] }), backgroundColor: C.neg, borderRadius: 2 }} />
              </View>
            </View>
            <Text style={[v.barLabel, { color: C.ink4 }]}>{months[i]}</Text>
          </View>
        ))}
      </View>
      <View style={v.legend}>
        <View style={v.legendItem}>
          <View style={[v.legendDot, { backgroundColor: C.pos }]} />
          <Text style={[v.legendText, { color: C.ink3 }]}>Ingresos</Text>
        </View>
        <View style={v.legendItem}>
          <View style={[v.legendDot, { backgroundColor: C.neg }]} />
          <Text style={[v.legendText, { color: C.ink3 }]}>Gastos</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const v = StyleSheet.create({
  chartCard: { borderRadius: Radius.lg, borderWidth: 0.5, padding: 16 },
  chartTitle: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2, marginBottom: 12 },
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  barGroup: { alignItems: 'center', gap: 4 },
  barLabel: { fontSize: 9, fontWeight: '500' },
  legend: { flexDirection: 'row', gap: 16, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendText: { fontSize: 11 },
});
