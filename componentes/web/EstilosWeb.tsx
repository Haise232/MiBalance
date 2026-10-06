import { useEffect } from 'react';
import { Platform } from 'react-native';

import { Palette, useAppTheme } from '@/constantes/tema';

const ID_ESTILO = 'mibalance-estilos-web';

function css(p: typeof Palette.light): string {
  return `
html, body { background: ${p.bg}; }
:focus-visible {
  outline: 2px solid ${p.accent};
  outline-offset: 2px;
  border-radius: 6px;
}
input:focus:not(:focus-visible), textarea:focus:not(:focus-visible) { outline: none; }
`;
}

/**
 * Estilos globales solo para web: foco visible con el acento del tema
 * (react-native-web elimina los outlines) y fondo de html/body acorde al tema.
 * Inyecta una única etiqueta <style> en document.head y la actualiza al cambiar el tema.
 */
export default function EstilosWeb() {
  const { isDark } = useAppTheme();

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    let estilo = document.getElementById(ID_ESTILO) as HTMLStyleElement | null;
    if (!estilo) {
      estilo = document.createElement('style');
      estilo.id = ID_ESTILO;
      document.head.appendChild(estilo);
    }
    estilo.textContent = css(isDark ? Palette.dark : Palette.light);
  }, [isDark]);

  return null;
}
