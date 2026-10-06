import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { LogBox, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import EstilosWeb from '@/componentes/web/EstilosWeb';
import { Palette } from '@/constantes/tema';
import { SesionProvider, useSesion } from '@/contextos/SesionContexto';
import { AppThemeProvider, useAppTheme } from '@/contextos/TemaContexto';
import { useTituloDocumento } from '@/hooks/useTituloDocumento';

LogBox.ignoreLogs([
  'expo-notifications',
  'expo-notifications: Android Push',
  '`expo-notifications` functionality',
]);

function temaNavegacion(base: Theme, p: typeof Palette.light): Theme {
  return {
    ...base,
    colors: {
      ...base.colors,
      background: p.bg,
      card: p.surface,
      text: p.ink,
      border: p.line,
      primary: p.accent,
      notification: p.accent,
    },
  };
}

const WarmLightTheme = temaNavegacion(DefaultTheme, Palette.light);
const WarmDarkTheme = temaNavegacion(DarkTheme, Palette.dark);

// ─── Root layout ─────────────────────────────────────────────────────────────

export const unstable_settings = {
  initialRouteName: '(pestañas)',
};

function AppShell() {
  const { isDark } = useAppTheme();
  const { cargando, sesion } = useSesion();
  const bg = (isDark ? Palette.dark : Palette.light).bg;
  useTituloDocumento();

  // El acceso por sesión lo resuelve Stack.Protected: al cambiar el guard,
  // Expo Router saca al usuario de las pantallas que dejan de estar disponibles
  // (login -> app al iniciar sesión, app -> login al cerrarla).
  // Bienvenida / tutorial dependen de flags de AsyncStorage que las propias
  // pantallas escriben; esa redirección vive en SesionContexto.
  return (
    <ThemeProvider value={isDark ? WarmDarkTheme : WarmLightTheme}>
      <EstilosWeb />
      {cargando ? (
        <View style={{ flex: 1, backgroundColor: bg }} />
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: bg },
            animation: 'none',
          }}
        >
          <Stack.Protected guard={!!sesion}>
            <Stack.Screen name="(pestañas)" />
            <Stack.Screen name="bienvenida" options={{ title: 'Bienvenida' }} />
            <Stack.Screen name="tutorial" options={{ title: 'Tutorial' }} />
            <Stack.Screen name="agregar" options={{ presentation: 'modal', title: 'Nuevo movimiento' }} />
            <Stack.Screen name="deudas" options={{ title: 'Deudas' }} />
            <Stack.Screen name="cuentas" options={{ title: 'Cuentas' }} />
            <Stack.Screen name="categorias" options={{ title: 'Categorías' }} />
            <Stack.Screen name="suscripciones" options={{ title: 'Suscripciones' }} />
          </Stack.Protected>
          <Stack.Protected guard={!sesion}>
            <Stack.Screen name="login" options={{ title: 'Iniciar sesión' }} />
            <Stack.Screen name="registro" options={{ title: 'Crear cuenta' }} />
          </Stack.Protected>
        </Stack>
      )}
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

function ThemedRoot() {
  const { isDark } = useAppTheme();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: (isDark ? Palette.dark : Palette.light).bg }}>
      <SesionProvider>
        <AppShell />
      </SesionProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <ThemedRoot />
    </AppThemeProvider>
  );
}
