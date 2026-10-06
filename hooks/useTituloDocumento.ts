import { usePathname } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

const NOMBRE_APP = 'MiBalance';

// Expo Router desactiva el `documentTitle` de React Navigation
// (ExpoRoot pasa `documentTitle={{ enabled: false }}`), así que `options.title`
// no llega a `document.title`. Lo resolvemos aquí a partir de la ruta.
const TITULOS: Record<string, string> = {
  '/': 'Inicio',
  '/movimientos': 'Movimientos',
  '/reportes': 'Reportes',
  '/yo': 'Ajustes',
  '/agregar': 'Nuevo movimiento',
  '/deudas': 'Deudas',
  '/cuentas': 'Cuentas',
  '/categorias': 'Categorías',
  '/suscripciones': 'Suscripciones',
  '/login': 'Iniciar sesión',
  '/registro': 'Crear cuenta',
  '/bienvenida': 'Bienvenida',
  '/tutorial': 'Tutorial',
};

function normalizar(ruta: string): string {
  const sinBarra = ruta.length > 1 ? ruta.replace(/\/+$/, '') : ruta;
  return sinBarra === '/index' ? '/' : sinBarra;
}

/** Mantiene `document.title` como "<Página> · MiBalance" (solo web). */
export function useTituloDocumento() {
  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const pagina = TITULOS[normalizar(pathname ?? '/')];
    document.title = pagina ? `${pagina} · ${NOMBRE_APP}` : NOMBRE_APP;
  }, [pathname]);
}
