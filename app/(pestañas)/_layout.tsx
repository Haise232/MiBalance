import { MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BarraLateral from '@/componentes/navegacion/BarraLateral';
import { PESTANAS } from '@/componentes/navegacion/pestanas';
import { useTheme, useAppTheme } from '@/constantes/tema';
import { useAtajosTeclado } from '@/hooks/useAtajosTeclado';
import { useDiseno } from '@/hooks/useDiseno';

// ─── Custom floating pill tab bar ─────────────────────────────────────────────

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const C = useTheme();
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const bottomMargin = Math.max(insets.bottom, 14);

  const routeNameToIndex = Object.fromEntries(
    state.routes.map((r, i) => [r.name, i])
  );

  return (
    <View
      style={[styles.outerWrapper, { bottom: bottomMargin }]}
      pointerEvents="box-none"
    >
      <View
        accessibilityRole="tablist"
        style={[
          styles.pillContainer,
          {
            backgroundColor: C.surface,
            borderColor: C.lineStrong,
          },
        ]}
      >
        {PESTANAS.map((slot, slotIndex) => {
          const routeIndex = routeNameToIndex[slot.routeName] ?? -1;
          const focused = state.index === routeIndex;
          const activeColor = C.ink;
          const inactiveColor = C.ink3;

          const onPress = () => {
            if (routeIndex === -1) return;
            const route = state.routes[routeIndex];
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(slot.routeName);
            }
          };

          const showFab = slotIndex === 2;

          return (
            <React.Fragment key={slot.routeName}>
              {showFab && (
                <TouchableOpacity
                  style={[styles.fab, { backgroundColor: isDark ? C.accent : C.ink }]}
                  onPress={() => router.push('/agregar')}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Nuevo movimiento"
                >
                  <Text style={[styles.fabPlus, { color: isDark ? '#1a1410' : C.bg }]}>+</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.tabItem,
                  focused && { backgroundColor: C.surface2 },
                ]}
                onPress={onPress}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={slot.label}
              >
                <MaterialIcons name={slot.icon} size={20} color={focused ? activeColor : inactiveColor} />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: focused ? activeColor : inactiveColor },
                  ]}
                >
                  {slot.labelCorto}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export default function TabLayout() {
  const { esAncho } = useDiseno();
  // Atajos de teclado (web) solo cuando las pestañas están en primer plano:
  // no deben dispararse con un modal (p. ej. /agregar) u otra pantalla encima.
  const enfocado = useIsFocused();
  useAtajosTeclado(enfocado);

  return (
    <Tabs
      tabBar={(props) =>
        esAncho ? <BarraLateral {...props} /> : <CustomTabBar {...props} />
      }
      screenOptions={{
        headerShown: false,
        // En pantallas anchas la barra lateral se coloca a la izquierda y el
        // contenido se dispone a su lado (bottom-tabs v7).
        tabBarPosition: esAncho ? 'left' : 'bottom',
        sceneStyle: { backgroundColor: 'transparent' },
        animation: 'none',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="movimientos" options={{ title: 'Movimientos' }} />
      <Tabs.Screen name="reportes" options={{ title: 'Reportes' }} />
      <Tabs.Screen name="yo" options={{ title: 'Ajustes' }} />
    </Tabs>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    pointerEvents: 'box-none',
  } as const,
  pillContainer: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 0.5,
    padding: 8,
    gap: 2,
    shadowColor: '#28190a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    minWidth: 64,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  fabPlus: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
    marginTop: -1,
  },
});
