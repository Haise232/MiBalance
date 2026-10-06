import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Radius, useTheme } from '@/constantes/tema';
import { useAnchoTutorial } from './medidas';

// ─── Visual 2: FAB pulsante ───────────────────────────────────────────────────

export function FabVisual() {
  const C = useTheme();
  const W = useAnchoTutorial();
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const formFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse the FAB
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.18, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(glow, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 600, easing: Easing.in(Easing.ease), useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      ])
    );
    pulse.start();

    // Show mini form after a delay
    const t = setTimeout(() => {
      Animated.timing(formFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 800);

    return () => {
      pulse.stop();
      clearTimeout(t);
    };
  }, []);

  return (
    <View style={v.fabWrap}>
      {/* Mini form preview */}
      <Animated.View style={[v.miniForm, { backgroundColor: C.surface, borderColor: C.line, opacity: formFade, width: W * 0.65 }]}>
        <View style={v.miniFormRow}>
          <View style={[v.miniChip, { backgroundColor: C.negSoft }]}>
            <Text style={[v.miniChipText, { color: C.neg }]}>Gasto</Text>
          </View>
          <View style={[v.miniChip, { backgroundColor: C.posSoft }]}>
            <Text style={[v.miniChipText, { color: C.pos }]}>Ingreso</Text>
          </View>
          <View style={[v.miniChip, { backgroundColor: C.warnSoft }]}>
            <Text style={[v.miniChipText, { color: C.warn }]}>Deuda</Text>
          </View>
        </View>
        <View style={[v.miniInput, { backgroundColor: C.surface2, borderColor: C.line }]}>
          <Text style={[v.miniInputText, { color: C.ink4 }]}>€ 0,00</Text>
        </View>
      </Animated.View>

      {/* FAB */}
      <Animated.View
        style={[
          v.fab,
          { backgroundColor: C.ink },
          { transform: [{ scale }] },
        ]}
      >
        <Animated.View style={{ opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.25] }), ...StyleSheet.absoluteFillObject, borderRadius: 28, backgroundColor: '#fff' }} />
        <Text style={[v.fabPlus, { color: C.bg }]}>+</Text>
      </Animated.View>
      <Text style={[v.fabHint, { color: C.ink4 }]}>Pulsa aquí</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const v = StyleSheet.create({
  fabWrap: { alignItems: 'center', gap: 12 },
  miniForm: {
    borderRadius: Radius.md,
    borderWidth: 0.5,
    padding: 14,
    gap: 10,
  },
  miniFormRow: { flexDirection: 'row', gap: 8 },
  miniChip: { flex: 1, paddingVertical: 7, borderRadius: Radius.pill, alignItems: 'center' },
  miniChipText: { fontSize: 12, fontWeight: '500' },
  miniInput: { height: 40, borderRadius: Radius.sm, borderWidth: 1, justifyContent: 'center', paddingHorizontal: 12 },
  miniInputText: { fontSize: 14 },
  fab: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  fabPlus: { fontSize: 28, fontWeight: '300', lineHeight: 32, marginTop: -1 },
  fabHint: { fontSize: 11, fontWeight: '500', letterSpacing: 0.3 },
});
