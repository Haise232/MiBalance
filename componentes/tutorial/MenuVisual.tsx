import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Radius, useTheme } from '@/constantes/tema';
import { useAnchoTutorial } from './medidas';

// ─── Visual 5: Menú desplegable ───────────────────────────────────────────────

export function MenuVisual() {
  const C = useTheme();
  const W = useAnchoTutorial();
  const height = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const items = [
    { icon: 'account-balance-wallet', label: 'Cuentas', color: C.pos },
    { icon: 'subscriptions', label: 'Suscripciones', color: C.accent },
    { icon: 'handshake', label: 'Deudas', color: C.warn },
  ];

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(height, { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: false }),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: false }),
        Animated.timing(rotate, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const chevronRotate = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const menuHeight = height.interpolate({ inputRange: [0, 1], outputRange: [0, items.length * 52 + 8] });

  return (
    <View style={{ width: W * 0.72 }}>
      <View style={[v.menuCard, { backgroundColor: C.surface, borderColor: C.line }]}>
        {/* Trigger row */}
        <View style={v.menuTrigger}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <MaterialIcons name="apps" size={18} color={C.ink2} />
            <Text style={[v.menuTriggerText, { color: C.ink }]}>Acceso rápido</Text>
          </View>
          <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={C.ink3} />
          </Animated.View>
        </View>

        {/* Menu items */}
        <Animated.View style={{ height: menuHeight, opacity, overflow: 'hidden' }}>
          <View style={{ paddingHorizontal: 10, paddingBottom: 8, gap: 4 }}>
            {items.map((item) => (
              <View key={item.label} style={[v.menuItem, { backgroundColor: C.surface2 }]}>
                <View style={[v.menuItemIcon, { backgroundColor: item.color + '22' }]}>
                  <MaterialIcons name={item.icon as any} size={15} color={item.color} />
                </View>
                <Text style={[v.menuItemText, { color: C.ink2 }]}>{item.label}</Text>
                <MaterialIcons name="chevron-right" size={16} color={C.ink4} />
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
      <Text style={[v.menuHint, { color: C.ink4 }]}>Disponible en la pantalla Inicio</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const v = StyleSheet.create({
  menuCard: { borderRadius: Radius.md, borderWidth: 0.5, overflow: 'hidden' },
  menuTrigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 13,
  },
  menuTriggerText: { fontSize: 14, fontWeight: '500' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, paddingVertical: 11,
    borderRadius: Radius.sm,
  },
  menuItemIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  menuItemText: { flex: 1, fontSize: 13, fontWeight: '500' },
  menuHint: { fontSize: 11, marginTop: 8, textAlign: 'center' },
});
