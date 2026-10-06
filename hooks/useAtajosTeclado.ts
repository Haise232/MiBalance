import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

function esCampoEditable(objetivo: EventTarget | null): boolean {
  if (!objetivo || typeof HTMLElement === 'undefined' || !(objetivo instanceof HTMLElement)) {
    return false;
  }
  const tag = objetivo.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    objetivo.isContentEditable
  );
}

/**
 * Atajos globales de teclado (solo web):
 * - `n` → nuevo movimiento
 *
 * `activo` permite desactivarlos (p. ej. cuando hay un modal encima).
 */
export function useAtajosTeclado(activo = true) {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS !== 'web' || !activo || typeof window === 'undefined') return;

    const alPulsar = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (esCampoEditable(e.target) || esCampoEditable(document.activeElement)) return;

      const tecla = e.key.toLowerCase();
      if (tecla === 'n') {
        e.preventDefault();
        router.push('/agregar');
      }
    };

    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [activo, router]);
}
