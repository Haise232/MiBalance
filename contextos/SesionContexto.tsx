import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { usePathname, useRouter } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { initDatabase } from '@/servicios/baseDatos';
import { supabase } from '@/servicios/supabase';

// ─── Claves de AsyncStorage ──────────────────────────────────────────────────
// bienvenida.tsx, tutorial.tsx y yo.tsx escriben estas mismas claves directamente.

export const ONBOARDING_KEY = 'mibalance_onboarding_done';
export const TUTORIAL_DONE_KEY = 'mibalance_tutorial_done';

type Flags = { onboarding: boolean; tutorial: boolean };

async function leerFlags(): Promise<Flags> {
  try {
    const [onboarding, tutorial] = await Promise.all([
      AsyncStorage.getItem(ONBOARDING_KEY),
      AsyncStorage.getItem(TUTORIAL_DONE_KEY),
    ]);
    return { onboarding: !!onboarding, tutorial: !!tutorial };
  } catch (e) {
    console.warn('[Sesion] No se pudieron leer los flags:', e);
    // Ante un fallo de almacenamiento no bloqueamos al usuario fuera de la app.
    return { onboarding: true, tutorial: true };
  }
}

// ─── Deep links (nativo) ─────────────────────────────────────────────────────
// Los enlaces de confirmación / recuperación de Supabase traen los tokens en la
// query o en el fragmento (#access_token=...). En web lo resuelve supabase-js
// (detectSessionInUrl), así que aquí solo se trata nativo.

function tokensDesdeUrl(url: string) {
  const params: Record<string, string | undefined> = {};
  const query = Linking.parse(url).queryParams ?? {};
  for (const [k, v] of Object.entries(query)) if (typeof v === 'string') params[k] = v;
  const hash = url.split('#')[1];
  if (hash) new URLSearchParams(hash).forEach((v, k) => { params[k] = v; });
  return { accessToken: params['access_token'], refreshToken: params['refresh_token'] };
}

function manejarDeepLink(url: string | null) {
  if (!url) return;
  const { accessToken, refreshToken } = tokensDesdeUrl(url);
  if (accessToken && refreshToken) {
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .catch((e) => console.warn('[Sesion] setSession desde deep link falló:', e));
  }
}

// ─── Contexto ────────────────────────────────────────────────────────────────

interface SesionCtx {
  cargando: boolean;
  sesion: Session | null;
  onboardingHecho: boolean;
  tutorialHecho: boolean;
  marcarOnboarding: () => Promise<void>;
  marcarTutorial: () => Promise<void>;
}

const SesionContext = createContext<SesionCtx | null>(null);

export function SesionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [cargando, setCargando] = useState(true);
  const [sesion, setSesion] = useState<Session | null>(null);
  const [flags, setFlags] = useState<Flags>({ onboarding: false, tutorial: false });

  // Resolvers que esperan al siguiente commit del provider (ver onAuthStateChange).
  const esperandoCommit = useRef<(() => void)[]>([]);
  useEffect(() => {
    if (esperandoCommit.current.length === 0) return;
    const pendientes = esperandoCommit.current;
    esperandoCommit.current = [];
    pendientes.forEach((resolver) => resolver());
  });
  const esperarCommit = useCallback(
    () =>
      new Promise<void>((resolve) => {
        esperandoCommit.current.push(resolve);
        // Si React descarta el render (estado idéntico) no hay commit: no colgar.
        setTimeout(resolve, 400);
      }),
    []
  );

  // Arranque: sesión + flags, suscripción a cambios de auth y deep links.
  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const [{ data }, f] = await Promise.all([supabase.auth.getSession(), leerFlags()]);
        if (!activo) return;
        setSesion(data.session);
        setFlags(f);
      } catch (e) {
        console.warn('[Sesion] Error al arrancar:', e);
      } finally {
        if (activo) setCargando(false);
      }
    })();

    // supabase-js espera (await) a este callback antes de resolver signIn/signOut.
    // Al esperar al commit, cuando login.tsx hace router.replace('/') tras el
    // signIn, los guards de Stack.Protected ya reflejan la sesión nueva.
    // No llamar a métodos de supabase aquí dentro (bloquearía el lock de auth).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, nueva) => {
      if (!activo || event === 'INITIAL_SESSION') return;
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        const f = await leerFlags();
        if (!activo) return;
        setFlags(f);
        setSesion(nueva);
        await esperarCommit();
        return;
      }
      setSesion(nueva);
    });

    let linkSub: { remove: () => void } | null = null;
    if (Platform.OS !== 'web') {
      Linking.getInitialURL().then(manejarDeepLink).catch(() => {});
      linkSub = Linking.addEventListener('url', ({ url }) => manejarDeepLink(url));
    }

    return () => {
      activo = false;
      subscription.unsubscribe();
      linkSub?.remove();
    };
  }, [esperarCommit]);

  // Sembrar / preparar la base de datos una vez por usuario autenticado.
  const userId = sesion?.user?.id;
  useEffect(() => {
    if (!userId) return;
    initDatabase().catch((e) => console.error('[Sesion] initDatabase error:', e));
  }, [userId]);

  // Onboarding / tutorial. Las pantallas bienvenida.tsx, tutorial.tsx y yo.tsx
  // escriben los flags en AsyncStorage y navegan por su cuenta, así que se
  // releen en cada cambio de ruta y la redirección se decide con los valores
  // recién leídos (nunca con los anteriores, que podrían estar obsoletos).
  useEffect(() => {
    if (cargando || !userId) return;
    let cancelado = false;
    leerFlags().then((f) => {
      if (cancelado) return;
      setFlags((prev) => (prev.onboarding === f.onboarding && prev.tutorial === f.tutorial ? prev : f));
      const destino = !f.onboarding ? '/bienvenida' : !f.tutorial ? '/tutorial' : null;
      if (destino && pathname !== destino) router.replace(destino);
    });
    return () => { cancelado = true; };
  }, [cargando, userId, pathname, router]);

  const marcarOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setFlags((prev) => ({ ...prev, onboarding: true }));
  }, []);

  const marcarTutorial = useCallback(async () => {
    await AsyncStorage.setItem(TUTORIAL_DONE_KEY, 'true');
    setFlags((prev) => ({ ...prev, tutorial: true }));
  }, []);

  const value = useMemo<SesionCtx>(
    () => ({
      cargando,
      sesion,
      onboardingHecho: flags.onboarding,
      tutorialHecho: flags.tutorial,
      marcarOnboarding,
      marcarTutorial,
    }),
    [cargando, sesion, flags, marcarOnboarding, marcarTutorial]
  );

  return <SesionContext.Provider value={value}>{children}</SesionContext.Provider>;
}

export function useSesion(): SesionCtx {
  const ctx = useContext(SesionContext);
  if (!ctx) throw new Error('useSesion debe usarse dentro de <SesionProvider>');
  return ctx;
}
