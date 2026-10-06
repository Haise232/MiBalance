import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/constantes/tema';

// ─── Puntos de progreso ───────────────────────────────────────────────────────

export function PuntosProgreso({ total, actual }: { total: number; actual: number }) {
  const C = useTheme();
  return (
    <View style={s.dots}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            s.dot,
            {
              backgroundColor: i === actual ? C.ink : C.surface3,
              width: i === actual ? 18 : 6,
            },
          ]}
        />
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginVertical: 20,
  },
  dot: { height: 6, borderRadius: 3 },
});
