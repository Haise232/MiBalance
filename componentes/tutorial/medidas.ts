import { useWindowDimensions } from 'react-native';

import { AnchoMax } from '@/constantes/layout';

// Los mockups se dimensionan según el ancho de la ventana, con tope para no
// crecer dentro de la tarjeta web. Reactivo: se reajusta al redimensionar.
export function useAnchoTutorial(): number {
  const { width } = useWindowDimensions();
  return Math.min(width, AnchoMax.tutorial);
}
