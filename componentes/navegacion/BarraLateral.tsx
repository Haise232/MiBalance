import { MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PESTANAS } from '@/componentes/navegacion/pestanas';
import { ES_WEB } from '@/constantes/plataforma';
import { Fonts, Radius, useAppTheme, useTheme, useWebTexture } from '@/constantes/tema';

export const ANCHO_BARRA_LATERAL = 240;

// En web, Pressable expone `hovered` en su estado; en nativo no existe.
type EstadoPressable = { pressed: boolean; hovered?: boolean };

const cursorPointer = ES_WEB ? ({ cursor: 'pointer' } as any) : null;

// Los atajos de teclado (hooks/useAtajosTeclado) solo existen en web.
const MOSTRAR_ATAJOS = ES_WEB;

/** Pequeña insignia de tecla para indicar el atajo de teclado. */
function Tecla({ texto, color, borde }: { texto: string; color: string; borde: string }) {
  return (
    <View
      style={[styles.tecla, { borderColor: borde }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={[styles.teclaTexto, { color }]}>{texto}</Text>
    </View>
  );
}

// ─── Barra lateral (escritorio / tablet) ──────────────────────────────────────

export default function BarraLateral({ state, navigation }: BottomTabBarProps) {
  const C = useTheme();
  const { isDark } = useAppTheme();
  const texture = useWebTexture();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const routeNameToIndex = Object.fromEntries(state.routes.map((r, i) => [r.name, i]));

  return (
    <View
      style={[
        styles.contenedor,
        texture,
        {
          backgroundColor: C.surface,
          borderRightColor: C.line,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 20,
          paddingLeft: insets.left + 16,
        },
      ]}
      accessibilityRole="tablist"
    >
      {/* ─── Marca ─── */}
      <View style={styles.marca}>
        <Image
          source={require('@/assets/logo/logo-mark.png')}
          style={styles.logo}
          contentFit="contain"
          accessibilityIgnoresInvertColors
        />
        <Text style={[styles.nombreApp, { color: C.ink, fontFamily: Fonts.serif }]}>MiBalance</Text>
      </View>

      {/* ─── Nuevo movimiento ─── */}
      <Pressable
        onPress={() => router.push('/agregar')}
        accessibilityRole="button"
        accessibilityLabel="Nuevo movimiento"
        style={(estado) => {
          const { pressed, hovered } = estado as EstadoPressable;
          return [
            styles.botonNuevo,
            cursorPointer,
            { backgroundColor: isDark ? C.accent : C.ink },
            (hovered || pressed) && { opacity: pressed ? 0.8 : 0.9 },
          ];
        }}
      >
        <MaterialIcons name="add" size={20} color={isDark ? '#1a1410' : C.bg} />
        <Text style={[styles.botonNuevoTexto, { color: isDark ? '#1a1410' : C.bg }]}>
          Nuevo movimiento
        </Text>
        {MOSTRAR_ATAJOS && (
          <Tecla
            texto="N"
            color={isDark ? 'rgba(26,20,16,0.7)' : 'rgba(239,242,236,0.75)'}
            borde={isDark ? 'rgba(26,20,16,0.3)' : 'rgba(239,242,236,0.35)'}
          />
        )}
      </Pressable>

      {/* ─── Pestañas ─── */}
      <View style={styles.lista}>
        {PESTANAS.map((pestana) => {
          const routeIndex = routeNameToIndex[pestana.routeName] ?? -1;
          if (routeIndex === -1) return null;
          const route = state.routes[routeIndex];
          const focused = state.index === routeIndex;
          const color = focused ? C.ink : C.ink3;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={pestana.routeName}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={pestana.label}
              style={(estado) => {
                const { pressed, hovered } = estado as EstadoPressable;
                return [
                  styles.fila,
                  cursorPointer,
                  focused
                    ? { backgroundColor: C.surface2 }
                    : (hovered || pressed) && { backgroundColor: C.surface2, opacity: 0.85 },
                ];
              }}
            >
              <View
                style={[
                  styles.indicador,
                  { backgroundColor: focused ? C.accent : 'transparent' },
                ]}
              />
              <MaterialIcons name={pestana.icon} size={20} color={color} />
              <Text
                style={[
                  styles.filaTexto,
                  { color, fontWeight: focused ? '600' : '500' },
                ]}
              >
                {pestana.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  contenedor: {
    width: ANCHO_BARRA_LATERAL,
    height: '100%',
    paddingRight: 16,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    marginBottom: 28,
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: Radius.xs,
  },
  nombreApp: {
    fontSize: 22,
    fontWeight: '400',
  },
  botonNuevo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: Radius.pill,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  botonNuevoTexto: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  lista: {
    gap: 4,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 44,
    paddingRight: 12,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  indicador: {
    width: 3,
    height: 20,
    borderRadius: 2,
    marginRight: 1,
  },
  filaTexto: {
    flex: 1,
    fontSize: 14,
    letterSpacing: 0.1,
  },
  tecla: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teclaTexto: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
    fontFamily: Platform.select({ web: 'ui-monospace, SFMono-Regular, Menlo, monospace', default: undefined }),
  },
});
